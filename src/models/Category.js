import mongoose from "mongoose";
import Book from "./Book.js";

let CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

CategorySchema.pre("remove", async function (next) {
    try {
        const categoryId = this._id;
        const books = await Book.find({
            categories: mongoose.Types.ObjectId(categoryId),
        });
        for (let i = 0; i < books.length; i++) {
            const book = books[i];
            book.categories = book.categories.filter((cat) => {
                return cat.toString() !== categoryId.toString();
            });
            await book.save();
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Category = mongoose.model("Category", CategorySchema);
export default Category;
