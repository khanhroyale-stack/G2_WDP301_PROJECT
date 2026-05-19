import Joi from "joi";
import { objectIdSchema } from "../middleware/validate.js";

export const reportIdParamsSchema = Joi.object({
  id: objectIdSchema,
});

export const createReportSchema = Joi.object({
  postId: objectIdSchema,
  reason: Joi.string().trim().min(3).max(255).required(),
  details: Joi.string().trim().max(1000).allow("").optional(),
  reportType: Joi.string().valid("spam", "fake", "prohibited", "scam", "other").optional(),
});

export const reviewReportSchema = Joi.object({
  action: Joi.string().valid("resolved", "dismissed").required(),
  adminNote: Joi.string().trim().max(1000).allow("").optional(),
  resolutionAction: Joi.string().valid("none", "hidden", "warning", "banSeller", "dismissed").optional(),
});

export const reportsQuerySchema = Joi.object({
  status: Joi.string().valid("pending", "resolved", "dismissed").optional(),
});
