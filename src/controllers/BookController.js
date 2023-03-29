import { async } from "@firebase/util";
import mongoose from "mongoose";
import Book from "../models/Book.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";
import { uploadImages, uploadImage } from "../utils/firebaseUpload.js";

export const getBooks = async (req, res, next) => {
    try {
        const orderBy = req.query.order_by || "desc";
        let sortBy = req.query.sort_by || "created-ad";
        let cat = req.query.category || null;
        const minPrice = parseInt(req.query.min_price) || 0;
        const maxPrice = parseInt(req.query.max_price) || Infinity;
        const limit = parseInt(req.query.limit) || 24;
        const frame = parseInt(req.query.frame) || 1;
        const skip = (frame - 1) * limit;
        if (sortBy === "price") {
        } else if (sortBy === "best-sellers") {
            // sortBy = "totalSold";
        } else if (sortBy === "created-at") {
            sortBy = "createdAt";
        } else {
            sortBy = "createdAt";
        }
        if (!mongoose.Types.ObjectId.isValid(cat)) {
            cat = null;
        }
        const project = {
            _id: 1,
            name: 1,
            publisher: 1,
            author: 1,
            price: 1,
            quantity: 1,
            totalSold: 1,
            ratingPoint: 1,
            numOfReviews: 1,
            description: 1,
            createdAt: 1,
            categories: {
                _id: 1,
                name: 1,
                description: 1,
            },
            images: 1,
        };
        if (sortBy === "best-sellers") {
            let query = Order.aggregate([
                {
                    $unwind: "$items",
                },
                {
                    $lookup: {
                        from: "books",
                        localField: "items.product",
                        foreignField: "_id",
                        as: "book",
                    },
                },
                {
                    $unwind: "$book",
                },
                {
                    $group: {
                        _id: "$items.product",
                        name: {
                            $first: "$book.name",
                        },
                        publisher: {
                            $first: "$book.publisher",
                        },
                        description: {
                            $first: "$book.description",
                        },
                        author: {
                            $first: "$book.author",
                        },
                        price: {
                            $first: "$book.price",
                        },
                        quantity: {
                            $first: "$book.quantity",
                        },
                        ratingPoint: {
                            $first: {
                                $toDouble: "$book.ratingPoint",
                            },
                        },
                        numOfReviews: {
                            $first: "$book.numOfReviews",
                        },
                        totalSold: {
                            $sum: "$items.quantity",
                        },
                        images: {
                            $first: "$book.images",
                        },
                        categories: {
                            $first: "$book.categories",
                        },
                    },
                },
                {
                    $match: {
                        price: {
                            $gte: minPrice,
                            $lte: maxPrice,
                        },
                    },
                },
                cat
                    ? {
                          $match: {
                              categories: mongoose.Types.ObjectId(cat),
                          },
                      }
                    : { $match: {} },
                {
                    $lookup: {
                        from: "categories",
                        localField: "categories",
                        foreignField: "_id",
                        as: "categories",
                    },
                },
                {
                    $sort: {
                        totalSold: orderBy === "asc" ? 1 : -1,
                    },
                },
                {
                    $skip: skip,
                },
                {
                    $limit: limit,
                },
                {
                    $project: project,
                },
            ]);
            const books = await query.exec();
            return res.status(200).json({ status: true, books: books });
        } else {
            Order.aggregate([
                {
                    $unwind: "$items",
                },
                {
                    $group: {
                        _id: "$items.product",
                        totalSold: {
                            $sum: "$items.quantity",
                        },
                    },
                },
            ])
                .then((booksSold) => {
                    Book.aggregate([
                        {
                            $match: {
                                price: {
                                    $gte: minPrice,
                                    $lte: maxPrice,
                                },
                            },
                        },
                        {
                            $sort: {
                                [sortBy]: orderBy === "asc" ? 1 : -1,
                            },
                        },
                        {
                            $skip: skip,
                        },
                        {
                            $limit: limit,
                        },
                        cat
                            ? {
                                  $match: {
                                      categories: mongoose.Types.ObjectId(cat),
                                  },
                              }
                            : { $match: {} },
                        {
                            $lookup: {
                                from: "categories",
                                localField: "categories",
                                foreignField: "_id",
                                as: "categories",
                            },
                        },
                        {
                            $project: project,
                        },
                    ])
                        .then((books) => {
                            const booksWithSales = books.map((book) => {
                                const sold = booksSold.find(
                                    (bookSold) =>
                                        bookSold._id.toString() ===
                                        book._id.toString()
                                );
                                const totalSold = sold ? sold.totalSold : 0;
                                return {
                                    _id: book._id,
                                    name: book.name,
                                    publisher: book.publisher,
                                    author: book.author,
                                    description: book.description,
                                    createdAt: book.createdAt,
                                    price: Number(book.price),
                                    ratingPoint: Number(book.ratingPoint),
                                    numOfReviews: Number(book.numOfReviews),
                                    quantity: book.quantity,
                                    categories: book.categories,
                                    images: book.images,
                                    totalSold,
                                };
                            });
                            return res
                                .status(200)
                                .json({ status: true, books: booksWithSales });
                        })
                        .catch((error) => {
                            res.status(500);
                            return next(
                                new Error(
                                    "Server Internal Error" + error.message
                                )
                            );
                        });
                })
                .catch((error) => {
                    res.status(500);
                    return next(
                        new Error("Server Internal Error" + error.message)
                    );
                });
        }
    } catch (error) {
        res.status(500);
        return next(new Error("Server Internal Error" + error.message));
    }
};

export const getBookById = async (req, res, next) => {
    try {
        let bookId = req.params.id;
        if (mongoose.Types.ObjectId.isValid(bookId)) {
            Book.findById(bookId)
                .select(
                    "_id name publisher author price quantity ratingPoint numOfReviews createdAt categories images"
                )
                .populate("categories", "_id name description")
                .then((result) => {
                    if (result) {
                        let a = Number(result.ratingPoint);
                        const data = { ...result._doc, ratingPoint: a };
                        return res.status(200).json({
                            status: true,
                            message: "Query successfully",
                            data: data,
                        });
                    } else {
                        return res.status(400).json({
                            status: false,
                            message: `Book is not found`,
                        });
                    }
                })
                .catch((e) => {
                    return res.status(400).json({
                        status: false,
                        message: `Get book error with: ${e.message}`,
                    });
                });
        } else {
            return res
                .status(400)
                .json({ status: false, message: "Book Id is not valid" });
        }
    } catch (error) {
        res.status(400);
        return next(new Error(`Error: ${error.message}`));
    }
};

export const addBook = async (req, res, next) => {
    try {
        const files = req.files;
        if (files.length < 1) {
            console.log("Error: Images must be uploaded");
            return res
                .status(400)
                .json({ status: false, message: "Images must be uploaded" });
        }
        let {
            name,
            publisher,
            categories,
            author,
            description,
            price,
            quantity,
        } = req.body;
        if (
            !name ||
            !publisher ||
            !author ||
            !description ||
            !price ||
            !quantity
        ) {
            return res
                .status(400)
                .json({ status: false, message: "All fields must be filled" });
        } else {
            price = parseInt(price);
            quantity = parseInt(quantity);
            let cats = categories ? JSON.parse(categories) : [];
            let uploadedImgs = await uploadImages(files);
            let images = uploadedImgs.map((e) => e.url);
            let checkCats = await Promise.all(
                cats.map(async (e) => {
                    try {
                        const cat = await Category.findById(e).exec();
                        if (cat) {
                            return true;
                        }
                        return false;
                    } catch (e) {
                        return false;
                    }
                })
            );
            const checkCat = checkCats.every((e) => e === true);
            if (checkCat) {
                let book = new Book({
                    name: name,
                    publisher: publisher,
                    categories: cats,
                    author: author,
                    description: description,
                    price: price,
                    quantity: quantity,
                    images: images,
                });
                book.save()
                    .then(async (b) => {
                        await b.populate("categories", "_id name description");
                        return res.status(201).json({
                            status: true,
                            data: {
                                _id: b._id,
                                name: b.name,
                                publisher: b.publisher,
                                author: b.author,
                                description: b.description,
                                createdAt: b.createdAt,
                                price: Number(b.price),
                                ratingPoint: Number(b.ratingPoint),
                                numOfReviews: Number(b.numOfReviews),
                                quantity: b.quantity,
                                categories: b.categories,
                                images: b.images,
                            },
                        });
                    })
                    .catch((e) => {
                        console.log(e.message);
                        return res.status(500).json({
                            status: false,
                            message: "Server Internal Error",
                        });
                    });
            } else {
                return res
                    .status(400)
                    .json({ status: false, message: "Categories have error" });
            }
        }
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ status: false, message: error.message });
    }
};

export const deleteBook = (req, res, next) => {
    try {
        let bookId = req.params.id;
        if (mongoose.Types.ObjectId.isValid(bookId)) {
            Book.deleteOne({ _id: bookId })
                .then((result) => {
                    return res.status(200).json({
                        status: true,
                        message: `Deleted ${result.deletedCount} books`,
                    });
                })
                .catch((e) => {
                    return res.status(400).json({
                        status: false,
                        message: `Delete error with: ${e.message}`,
                    });
                });
        } else {
            return res
                .status(400)
                .json({ status: false, message: "Book Id is not valid" });
        }
    } catch (error) {
        res.status(400);
        return next(new Error(`Server Error: ${error.message}`));
    }
};

// Temporarily this api allows updating data except images
export const updateBook = async (req, res, next) => {
    try {
        let {
            bookId,
            name,
            publisher,
            description,
            author,
            price,
            quantity,
            categories,
        } = req.body;
        let newData = {};
        if (mongoose.Types.ObjectId.isValid(bookId)) {
            if (
                !name &&
                !publisher &&
                !description &&
                !author &&
                !price &&
                !quantity &&
                !categories
            )
                return res
                    .status(200)
                    .json({ status: false, message: "Nothing changes" });
            if (name) newData.name = name;
            if (publisher) newData.publisher = publisher;
            if (description) newData.description = description;
            if (author) newData.author = author;
            if (price && parseInt(price) >= 0) newData.price = price;
            if (quantity && parseInt(quantity) >= 0)
                newData.quantity = quantity;
            let checkCats = Array.isArray(categories)
                ? await Promise.all(
                      categories.map(async (e) => {
                          try {
                              const cat = await Category.findById(e).exec();
                              if (cat) {
                                  return true;
                              }
                              return false;
                          } catch (e) {
                              return false;
                          }
                      })
                  )
                : [];
            const checkCat = checkCats.every((e) => e === true);
            if (checkCat) {
                if (Array.isArray(categories) && categories.length > 0)
                    newData.categories = categories;
                const book = await Book.findByIdAndUpdate(bookId, newData, {
                    new: true,
                }).exec();
                if (book) {
                    await book.populate("categories", "_id name description");
                    return res.status(200).json({
                        status: true,
                        message: "Update successfully",
                        data: {
                            _id: book._id,
                            name: book.name,
                            publisher: book.publisher,
                            author: book.author,
                            description: book.description,
                            createdAt: book.createdAt,
                            price: Number(book.price),
                            ratingPoint: Number(book.ratingPoint),
                            numOfReviews: Number(book.numOfReviews),
                            quantity: book.quantity,
                            categories: book.categories,
                            images: book.images,
                        },
                    });
                } else {
                    return res
                        .status(400)
                        .json({ status: false, message: "Update failed" });
                }
            } else {
                return res
                    .status(400)
                    .json({ status: false, message: "Categories have error" });
            }
        } else {
            return res
                .status(400)
                .json({ status: false, message: "Book ID is not valid" });
        }
    } catch (error) {
        res.status(400);
        return next(new Error(`Error with: ${error.message}`));
    }
};

export const searchBooks = async (req, res, next) => {
    try {
        let searchKeyword = req.body.value;
        let limit = parseInt(req.body.limit);
        limit = limit > 0 ? limit : 24;
        let frame = parseInt(req.body.frame);
        frame = frame > 0 ? frame : 1;
        const regex = new RegExp(searchKeyword, "i");
        const books = await Book.find({
            $or: [
                { name: { $regex: regex } },
                { author: { $regex: regex } },
                { "categories.name": { $regex: regex } },
            ],
        })
            .populate("categories", "_id name description")
            .skip((frame - 1) * limit)
            .limit(limit)
            .select(
                "_id name publisher categories author description price quantity images createdAt ratingPoint numOfReviews"
            );
        let data = books.map((book) => ({
            ...book._doc,
            ratingPoint: Number(book.ratingPoint),
        }));
        return res
            .status(200)
            .json({ status: true, message: "Search OK", data: data });
    } catch (error) {
        res.status(400);
        return next(new Error(`Error: ${error.message}`));
    }
};
