import express from "express";
import * as bookController from "../controllers/BookController.js";
import { checkPermission, verifyToken } from "../middlewares/authMiddleware.js";

const bookRoute = express.Router();

bookRoute.get("/get", bookController.getBooksByCategory);
bookRoute.get("/get/:id", bookController.getBookById);

bookRoute.post("/create", verifyToken, checkPermission, bookController.addBook);
bookRoute.delete(
    "/delete",
    verifyToken,
    checkPermission,
    bookController.deleteBook
);
bookRoute.patch(
    "/update",
    verifyToken,
    checkPermission,
    bookController.updateBook
);
bookRoute.patch(
    "/update-star",
    verifyToken,
    checkPermission,
    bookController.updateStar
);

export default bookRoute;
