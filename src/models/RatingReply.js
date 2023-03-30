import mongoose from "mongoose";

const RatingReplySchema = new mongoose.Schema(
    {
        comment: String,
        rating: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Rating",
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const RatingReply = mongoose.model("RatingReply", RatingReplySchema);

export { RatingReplySchema };

export default RatingReply;
