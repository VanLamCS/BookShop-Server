import express from "express";
import * as CategoryController from "../controllers/CategoryController.js";
import { isAdmin, verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", CategoryController.getCategories);

router.post("/create", verifyToken, isAdmin, CategoryController.addCategory);
router.delete(
    "/delete/:id",
    verifyToken,
    isAdmin,
    CategoryController.deleteCategory
);
router.patch(
    "/update",
    verifyToken,
    isAdmin,
    CategoryController.updateCategory
);

export default router;
