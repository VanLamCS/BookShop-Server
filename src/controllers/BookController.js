import Book from "../models/Book.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";
import { uploadImages, uploadImage } from "../utils/firebaseUpload.js";

export const getBooks = async (req, res, next) => {
    try {
        let orderBy = req.query.order_by || "createdAt";
        const sortBy = req.query.sort_by || "desc";
        const minPrice = parseInt(req.query.min_price) || 0;
        const maxPrice = parseInt(req.query.max_price) || Infinity;
        const limit = parseInt(req.query.limit) || 24;
        const frame = parseInt(req.query.frame) || 1;
        const skip = (frame - 1) * limit;
        if (orderBy === "price" || orderBy === "createdAt") {
        } else if (orderBy === "best-sellers") {
            // orderBy = "totalSold";
        } else {
            orderBy = "createdAt";
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
        if (orderBy === "best-sellers") {
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
                        totalSold: sortBy === "asc" ? 1 : -1,
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
                                [orderBy]: sortBy === "asc" ? 1 : -1,
                            },
                        },
                        {
                            $skip: skip,
                        },
                        {
                            $limit: limit,
                        },
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
                                    ...book,
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

export const getBookById = (req, res, next) => {
    res.status(200).json({ message: "Query a book by Id endpoints" });
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
            !categories ||
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
            let cats = JSON.parse(categories);
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
                    .then((b) => {
                        return res
                            .status(201)
                            .json({ status: true, data: book });
                    })
                    .catch((e) => {
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
    res.status(200).json({ message: "Delete a book endpoints" });
};

export const updateBook = (req, res, next) => {
    res.status(200).json({ message: "Update a book endpoints" });
};
