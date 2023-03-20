import express from "express";
import * as CategoryController from "../controllers/CategoryController.js";
import { checkPermission, verifyToken } from "../middlewares/authMiddleware.js";

const categoryRoute = express.Router();

categoryRoute.get("/get", CategoryController.getAllCategory);
 
categoryRoute.post("/create", verifyToken, checkPermission, CategoryController.addCategory);
categoryRoute.delete("/delete", verifyToken, checkPermission, CategoryController.deleteCategory);
categoryRoute.patch("/update", verifyToken, checkPermission, CategoryController.updateCategory);


export default categoryRoute;

