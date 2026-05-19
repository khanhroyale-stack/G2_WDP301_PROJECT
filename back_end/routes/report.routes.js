import express from "express";
import { createReport, getReports, reviewReport } from "../controllers/report.controller.js";
import { authMiddleware, isAdmin } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import {
	createReportSchema,
	reviewReportSchema,
	reportsQuerySchema,
	reportIdParamsSchema,
} from "../validators/report.validator.js";

const router = express.Router();

router.post("/", authMiddleware, validateBody(createReportSchema), createReport);
router.get("/", authMiddleware, isAdmin, validateQuery(reportsQuerySchema), getReports);
router.patch("/:id/review", authMiddleware, isAdmin, validateParams(reportIdParamsSchema), validateBody(reviewReportSchema), reviewReport);

export default router;
