import Joi from "joi";
import { objectIdSchema } from "../middleware/validate.js";

export const sellerIdParamsSchema = Joi.object({
  sellerId: objectIdSchema,
});

export const createReviewSchema = Joi.object({
  orderId: objectIdSchema,
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().max(1000).allow("").optional(),
});
