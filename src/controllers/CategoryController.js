import Category from "../models/Category.js";

export const getCategories = (req, res, next) => {
    res.status(200).json({ message: "Query categories endpoints" });
};

export const addCategory = (req, res, next) => {
    res.status(200).json({ message: "Add a category endpoints" });
};

export const deleteCategory = (req, res, next) => {
    res.status(200).json({ message: "Delete a category endpoints" });
};

export const updateCategory = (req, res, next) => {
    res.status(200).json({ message: "Update a category endpoints" });
};
