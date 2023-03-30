import Rating from "../models/Rating.js";
import Order from "../models/Order.js";
import Book from "../models/Book.js";
import RatingReply from "../models/RatingReply.js";
import mongoose from "mongoose";

async function updateRatingPoint(bookId, rating, increment = true) {
    try {
        const book = await Book.findById(bookId);
        const m = increment ? book.numOfReviews + 1 : book.numOfReviews - 1;
        if (!increment) {
            rating = -rating;
        }
        const newRatingPoint =
            (book.ratingPoint * book.numOfReviews + rating) / (m ? m : 1);
        await Book.findByIdAndUpdate(bookId, {
            ratingPoint: newRatingPoint,
            numOfReviews: m,
        });
        return { status: true, ratingPoint: newRatingPoint, numOfReviews: m };
    } catch (error) {
        return { status: false, ratingPoint: null, numOfReviews: null };
    }
}

export const rating = async (req, res, next) => {
    try {
        const userId = req.user._id;
        let { bookId, rating, comment } = req.body;
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res
                .status(400)
                .json({ status: false, message: "Book ID is not valid" });
        }
        if (rating === undefined) {
            return res
                .status(400)
                .json({ status: false, message: "Rating must be not empty" });
        } else {
            rating = parseInt(rating);
        }
        const order = await Order.find({
            customer: userId,
            "items.product": mongoose.Types.ObjectId(bookId),
            status: "Delivered",
        });
        if (Array.isArray(order) && order.length == 0) {
            return res.status(403).json({
                status: false,
                message: "You are not authorized to rate this book.",
            });
        }
        const newRating = new Rating({
            customer: userId,
            book: bookId,
            rating,
            comment,
        });
        await newRating.save();
        // Update ratingPoint in Book
        const urp = await updateRatingPoint(bookId, rating);
        if (urp.status) {
            return res.status(201).json({
                status: true,
                message: "Rate successfully",
                data: {
                    _id: newRating._id,
                    book: newRating.book,
                    rating: newRating.rating,
                    comment: newRating.comment,
                    ratingPoint: urp.ratingPoint,
                    numOfReviews: urp.numOfReviews,
                },
            });
        } else {
            return res.status(400).json({
                status: false,
                message: "Rate failed",
            });
        }
    } catch (error) {
        res.status(500);
        return next(new Error(error.message));
    }
};

export const getRatings = async (req, res, next) => {
    try {
        let bookId = req.params.bookId;
        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res
                .status(400)
                .json({ status: false, message: "Book ID is not valid" });
        }
        let limit = req.query.limit;
        let frame = req.query.frame;
        limit = limit ? parseInt(limit) : 24;
        limit = limit > 0 ? limit : 24;
        frame = frame ? parseInt(frame) : 1;
        frame = frame > 0 ? frame : 1;
        let ratings = await Rating.find({ book: bookId })
            .populate("customer", "_id name avatar")
            .populate({
                path: "replies",
                select: "_id comment createdAt",
                populate: {
                    path: "user",
                    select: "_id name avatar",
                },
                limit: 12,
            })
            .select("_id rating comment customer createdAt replies")
            .skip((frame - 1) * limit)
            .limit(limit);
        return res.status(200).json({
            status: true,
            message: "Get ratings successfully",
            data: ratings,
        });
    } catch (error) {
        res.status(400);
        return next(new Error(`Error: ${error.message}`));
    }
};

export const ratingReply = async (req, res, next) => {
    try {
        const ratingId = req.params.ratingId; // String
        const userId = req.user._id; // ObjectId
        const userRole = req.user.role;
        let comment = req.body.comment;
        if (!comment) {
            return res
                .status(400)
                .json({ status: false, message: "Comment is not null" });
        }
        if (!mongoose.Types.ObjectId.isValid(ratingId)) {
            return res
                .status(400)
                .json({ status: false, message: "Rating ID is not valid" });
        }
        const rating = await Rating.findById(ratingId);
        if (
            rating.customer.toString() !== userId.toString() &&
            userRole !== "admin"
        ) {
            return res.status(403).json({
                status: false,
                message: "You don't have permission to do this action",
            });
        }
        const reply = new RatingReply({
            rating: ratingId,
            user: userId,
            comment,
        });
        await reply.save();
        rating.replies = [...rating.replies, reply._id];
        await rating.save();
        return res.status(201).json({
            status: true,
            message: "Reply successfully",
            data: {
                // ratingId: ratingId,
                _id: reply._id,
                comment: reply.comment,
                createdAt: reply.createdAt,
            },
        });
    } catch (error) {
        res.status(500);
        return next(new Error(`Error: ${error.message}`));
    }
};

export const getReplies = async (req, res, next) => {
    try {
        let ratingId = req.params.ratingId;
        if (!mongoose.Types.ObjectId.isValid(ratingId)) {
            return res
                .status(400)
                .json({ status: false, message: "Rating ID is not valid" });
        }
        let limit = req.query.limit;
        let frame = req.query.frame;
        limit = limit ? parseInt(limit) : 12;
        limit = limit > 0 ? limit : 12;
        frame = frame ? parseInt(frame) : 1;
        frame = frame > 0 ? frame : 1;
        let replies = await RatingReply.find({ rating: ratingId })
            .populate("user", "_id name avatar")
            .select("_id comment user createdAt")
            .skip((frame - 1) * limit)
            .limit(limit);
        return res.status(200).json({
            status: true,
            message: "Get replies successfully",
            data: replies,
        });
    } catch (error) {
        res.status(400);
        return next(new Error(`Error: ${error.message}`));
    }
};

export const updateRating = async (req, res, next) => {
    let { ratingId, comment, rating } = req.body;
    if (!mongoose.Types.ObjectId.isValid(ratingId)) {
        return res
            .status(400)
            .json({ status: false, message: "Rating ID is not valid" });
    }
    let updateObj = {};
    if (comment) {
        updateObj.comment = comment;
    }
    if (rating && parseInt(rating) >= 0 && parseInt(rating) <= 5) {
        updateObj.rating = parseInt(rating);
    }
    if (updateObj === {}) {
        return res
            .status(400)
            .json({ status: false, message: "Nothing updates" });
    }
    try {
        const userId = req.user._id;
        let rt = await Rating.findById(ratingId);
        if (userId.toString() !== rt.customer.toString()) {
            return res.status(403).json({
                status: false,
                message: "You don't have permission to do this action",
            });
        }
        let urp = await updateRatingPoint(rt.book, rt.rating, false);
        urp = await updateRatingPoint(rt.book, rating, true);
        let ur = await findByIdAndUpdate(ratingId, updateObj);
        return res.status(200).json({
            status: true,
            message: "Update successfully",
            data: {
                _id: ur._id,
                book: ur.book,
                rating: ur.rating,
                comment: ur.comment,
                ratingPoint: urp.ratingPoint,
                numOfReviews: urp.numOfReviews,
            },
        });
    } catch (error) {
        res.status(400);
        return next(new Error(`Error: ${error.message}`));
    }
};

export const deleteRating = async (req, res, next) => {
    try {
        let userId = req.user._id;
        let ratingId = req.params.ratingId;
        if (!mongoose.Types.ObjectId.isValid(ratingId)) {
            return res
                .status(400)
                .json({ status: false, message: "Rating ID is not valid" });
        }

        let ratingWillDel = await Rating.findById(ratingId);
        if (!ratingWillDel) {
            return res
                .status(400)
                .json({ status: false, message: "Rating is not valid" });
        }
        if (
            ratingWillDel.customer.toString() !== userId.toString() &&
            userRole !== "admin"
        ) {
            return res.status(403).json({
                status: false,
                message: "You don't have permission to do this action",
            });
        }
        const bookId = ratingWillDel.book;
        // Update rating point
        let urp = await updateRatingPoint(
            ratingWillDel.book,
            ratingWillDel.rating,
            false
        );
        // Delete replies
        for (let i in ratingWillDel.replies) {
            await RatingReply.findByIdAndDelete(ratingWillDel.replies[i]);
        }
        // Delete rating
        await Rating.findByIdAndDelete(ratingId);
        return res.status(200).json({
            status: true,
            message: "Delete successfully",
            data: {
                book: bookId,
                ratingPoint: urp.ratingPoint,
                numOfReviews: urp.numOfReviews,
            },
        });
    } catch (error) {
        res.status(500);
        return next(new Error(`Error: ${error.message}`));
    }
};
