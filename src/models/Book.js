import mongoose from "mongoose";

const Schema = mongoose.Schema;

const BookSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        publisher: {
            type: String,
            required: true,
        },
        categories: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Category",
        },
        author: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            min: 0,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
        },
        images: {
            type: [String],
            required: true,
        },
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
