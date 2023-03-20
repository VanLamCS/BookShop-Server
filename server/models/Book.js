import mongoose from "mongoose";

const Schema = mongoose.Schema;

const BookSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        publisher: String,
        categories: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Category",
        },
        author: String,
        description: String,
        price: Number,
        available: Boolean,
        images: [String],
        ratingPoint: {
            type: mongoose.Schema.Types.Decimal128,
            default: 0,
        },
        numOfReviews: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Book = mongoose.model("Book", BookSchema);
export default Book;
