import express from "express";
import * as orderController from "../controllers/OrderController.js";
import { isAdmin, verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken, orderController.createOrder);

router.put(
    "/update-status",
    verifyToken,
    isAdmin,
    orderController.updateStatus
);

export default router;
