import express from "express";
import * as bookController from "../controllers/BookController.js";

const bookRoute = express.Router();

bookRoute.get("/get", bookController.getBooksByCategory);
bookRoute.get("/get/:id", bookController.getBookById);

bookRoute.post("/create", bookController.addBook);
bookRoute.delete("/delete", bookController.deleteBook);
bookRoute.patch("/update", bookController.updateBook);
bookRoute.patch('/update-star', bookController.updateStar);


export default bookRoute;
