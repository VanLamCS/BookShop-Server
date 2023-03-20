import Category from '../models/Category.js'
import Book from '../models/Book.js'
import User from '../models/User.js'

//------- Add a new category ----------------
export const addCategory = async (req, res) => {
    try {
        const { name, description } = req.body
        const newCategory = new Category({ name, description });
        await newCategory.save();

        return res.status(200).json({
            message: 'Create a category successfully!!!',
            data: newCategory
        })
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};
//------- Update category --------------------------------
export const updateCategory = async (req, res) => {
    try {
        const { name, description, categoryId } = req.body

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
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};
//-------- Delete category --------------------
export const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.body
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


