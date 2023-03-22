import Book from "../models/Book.js";

export const getBooksByCategory = (req, res, next) => {
    res.status(200).json({ message: "Query books in a category endpoints" });
};

export const getBookById = (req, res, next) => {
    res.status(200).json({ message: "Query a book by Id endpoints" });
};

export const addBook = (req, res, next) => {
    res.status(200).json({ message: "Add a book endpoints" });
};

export const deleteBook = (req, res, next) => {
    res.status(200).json({ message: "Delete a book endpoints" });
};

export const updateBook = (req, res, next) => {
    res.status(200).json({ message: "Update a book endpoints" });
};
