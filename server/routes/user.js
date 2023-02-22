import express from "express";
import * as userController from "../controllers/userController.js";

const router = express.Router();

router.post("/user", userController.registerUser);
router.post("/user/login", userController.authUser);

export default router;
