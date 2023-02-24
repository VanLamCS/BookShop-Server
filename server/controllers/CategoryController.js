import Category from '../models/Category.js'
import Book from '../models/Book.js'
import User from '../models/User.js'

//------- Add a new category ----------------
export const addCategory = async (req, res) => {
    try {
        const { name, description, userId } = req.body;
        const user = await User.findById(userId);
        if (user.role == 'admin') {
            const newCategory = new Category({ name, description });
            await newCategory.save();

            return res.status(200).json({
                message: 'Create a category successfully!!!',
                data: newCategory
            })
        } else {
            return res.status(500).json({ message: "Your account don\'t have permissions to add this category" })
        }
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};
//------- Update category --------------------------------
export const updateCategory = async (req, res) => {
    try {
        const { name, description, categoryId, userId } = req.body;
        const user = await User.findById(userId);
        if (user.role == 'admin') {
            const updateCategory = await Category.findByIdAndUpdate(categoryId, {
                name,
                description,
            });
            if(!updateCategory) {
                return res.status(200).json({
                    message: 'A Category not found!!!'
                })
            }
            return res.status(200).json({
                message: 'Update a category successfully!!!',
                data: updateCategory
            })
        } else {
            return res.status(500).json({ message: "Your account don\'t have permissions to update this category" })

        }
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};
//-------- Delete category --------------------
export const deleteCategory = async (req, res) => {
    try {
        const { categoryId, userId } = req.body;
        const user = await User.findById(userId);
        if (user && user.role == 'admin') {
            const listProduct = await Book.find({
                typeId: categoryId,
            });
            listProduct.forEach((item) => {
                item.delete();
            });
            await Category.findByIdAndDelete(categoryId);
            return res.status(200).json({
                message: 'Delete a category successfully!!!'
            })
        } else {
            return res.status(500).json({ message: "Your account don\'t have permissions to delete this category" })

        }
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};
//------- Get all ---------------
export const getAllCategory = async function (req, res) {
    try {
        const listCategory = await Category.find({});
        const dataResponse = {
            listCategory: listCategory,
        };
        return res.status(200).json({
            message: 'Get all categories successfully!!!'
        })
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};


