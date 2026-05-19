import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { createReview, getMyReviews, getSellerReviews } from "../controllers/review.controller.js";
import { createReviewSchema, sellerIdParamsSchema } from "../validators/review.validator.js";

const router = express.Router();

router.get("/seller/:sellerId", validateParams(sellerIdParamsSchema), getSellerReviews);
router.get("/me", authMiddleware, getMyReviews);
router.post("/", authMiddleware, validateBody(createReviewSchema), createReview);

export default router;
