import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import * as ratingController from "../controllers/RatingController.js";

const router = express.Router();

router.post("/", verifyToken, ratingController.rating);

router.get("/:bookId", ratingController.getRatings);

router.post("/reply/:ratingId", verifyToken, ratingController.ratingReply);
router.get("/reply/:ratingId", ratingController.getReplies);
router.patch("/update", verifyToken, ratingController.updateRating);
router.delete("/:ratingId", verifyToken, ratingController.deleteRating);

export default router;
