import mongoose from "mongoose";
const CategorySchema = new mongoose.Schema(
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
    const categoryId = this._id;
    await Book.updateMany(
        { categories: categoryId },
        { $pull: { categories: categoryId } }
    );
});
const Category = mongoose.model("Category", CategorySchema);
export default Category;
