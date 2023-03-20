import express from "express";
import * as bookController from "../controllers/BookController.js";
import { isAdmin, verifyToken } from "../middlewares/authMiddleware.js";

const bookRoute = express.Router();

bookRoute.get("/get", bookController.getBooksByCategory);
bookRoute.get("/get/:id", bookController.getBookById);

bookRoute.post("/create", verifyToken, isAdmin, bookController.addBook);
bookRoute.delete("/delete", verifyToken, isAdmin, bookController.deleteBook);
bookRoute.patch("/update", verifyToken, isAdmin, bookController.updateBook);

export default bookRoute;
