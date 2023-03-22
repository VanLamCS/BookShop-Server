import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
    {
        ReviewPoint: Number,
        description: String,
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
        },
    },
    {
        timestamps: true,
    }
);

const Review = mongoose.model("Review", ReviewSchema);

export default Review;
