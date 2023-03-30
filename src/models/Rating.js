import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
    {
        rating: {
            type: Number,
            min: 0,
            max: 5,
            required: true,
        },
        comment: {
            type: String,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: true,
        },
        replies: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "RatingReply",
        },
    },
    {
        timestamps: true,
    }
);

const Rating = mongoose.model("Rating", RatingSchema);

export default Rating;
