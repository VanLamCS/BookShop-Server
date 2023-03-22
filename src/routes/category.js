import express from "express";
import * as CategoryController from "../controllers/CategoryController.js";
import { isAdmin, verifyToken } from "../middlewares/authMiddleware.js";

const categoryRoute = express.Router();

categoryRoute.get("/", CategoryController.getCategories);

categoryRoute.post(
    "/create",
    verifyToken,
    isAdmin,
    CategoryController.addCategory
);
categoryRoute.delete(
    "/delete",
    verifyToken,
    isAdmin,
    CategoryController.deleteCategory
);
categoryRoute.patch(
    "/update",
    verifyToken,
    isAdmin,
    CategoryController.updateCategory
);

export default categoryRoute;
