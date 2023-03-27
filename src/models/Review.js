import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
    {
        reviewPoint: {
            type: Number,
            min: 0,
            max: 5,
        },
        description: {
            type: String,
            required: true,
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
        },
        replies: [
            {
                message: String,
                userId: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Review = mongoose.model("Review", ReviewSchema);

export default Review;
