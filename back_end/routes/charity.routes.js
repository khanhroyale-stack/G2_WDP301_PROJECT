import express from "express";
import { createCharity, getAllCharities, getCharityStats, getCharityWithDonations, donateToCharity, updateCharity, deleteCharity } from "../controllers/charity.controller.js";
import { authMiddleware, isAdmin } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import {
	charityIdParamsSchema,
	createCharitySchema,
	updateCharitySchema,
	donateSchema,
} from "../validators/charity.validator.js";

const router = express.Router();

router.get("/stats", getCharityStats);
router.get("/", getAllCharities);
router.get("/:id", validateParams(charityIdParamsSchema), getCharityWithDonations);
router.post("/:id/donate", validateParams(charityIdParamsSchema), validateBody(donateSchema), donateToCharity);

// Admin only routes
router.post("/", authMiddleware, isAdmin, validateBody(createCharitySchema), createCharity);
router.put("/:id", authMiddleware, isAdmin, validateParams(charityIdParamsSchema), validateBody(updateCharitySchema), updateCharity);
router.delete("/:id", authMiddleware, isAdmin, validateParams(charityIdParamsSchema), deleteCharity);

export default router;