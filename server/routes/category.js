import express from "express";
import * as CategoryController from "../controllers/CategoryController.js";

const categoryRoute = express.Router();

categoryRoute.get("/get", CategoryController.getAllCategory);
categoryRoute.post("/create", CategoryController.addCategory);
categoryRoute.delete("/delete", CategoryController.deleteCategory);
categoryRoute.patch("/update", CategoryController.updateCategory);


export default categoryRoute;

