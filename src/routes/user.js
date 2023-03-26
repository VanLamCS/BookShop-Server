import express from "express";
import * as userController from "../controllers/UserController.js";
import { isAdmin, verifyToken } from "../middlewares/authMiddleware.js";
import { upload } from "../utils/firebaseUpload.js";

const router = express.Router();

router.post("/", userController.registerUser);
router.post("/login", userController.authUser);
router.patch("/update", verifyToken, userController.updateProfile);
router.patch("/update-password", verifyToken, userController.updatePassword);
router.patch(
    "/update-avatar",
    verifyToken,
    upload.single("avatar"),
    userController.updateAvatar
);
router.post(
    "/create-admin",
    verifyToken,
    isAdmin,
    userController.createAdminAccount
);

export default router;
