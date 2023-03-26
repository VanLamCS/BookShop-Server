import Book from "../models/Book.js";
import { uploadImages, uploadImage } from "../utils/firebaseUpload.js";

export const getBooksByCategory = (req, res, next) => {
    res.status(200).json({ message: "Query books in a category endpoints" });
};

export const getBookById = (req, res, next) => {
    res.status(200).json({ message: "Query a book by Id endpoints" });
};

export const addBook = async (req, res, next) => {
    try {
        // const files = req.files;
        // let name = req.body["name"];
        // let publisher = req.body["publisher"];
        // let categories = req.body["categories"];
        // console.log(files, name, publisher, JSON.parse(categories));
        // res.status(201).json({ status: true, message: "Create successfully" });
    } catch (error) {}
};

export const deleteBook = (req, res, next) => {
    res.status(200).json({ message: "Delete a book endpoints" });
};

export const updateBook = (req, res, next) => {
    res.status(200).json({ message: "Update a book endpoints" });
};
