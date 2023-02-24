import express from "express";
import * as userController from "../controllers/UserController.js";

const router = express.Router();

router.post("/user", userController.registerUser);
router.post("/user/login", userController.authUser);

export default router;
