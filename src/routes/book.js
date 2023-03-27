import express from "express";
import * as bookController from "../controllers/BookController.js";
import { isAdmin, verifyToken } from "../middlewares/authMiddleware.js";
import { upload } from "../utils/firebaseUpload.js";

const router = express.Router();

router.get("/get", bookController.getBooks);
router.get("/get/:id", bookController.getBookById);

router.post(
    "/create",
    verifyToken,
    isAdmin,
    upload.array("images"),
    bookController.addBook
);
router.delete("/delete", verifyToken, isAdmin, bookController.deleteBook);
router.patch("/update", verifyToken, isAdmin, bookController.updateBook);

export default router;
