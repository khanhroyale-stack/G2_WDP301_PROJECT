import Joi from "joi";
import { objectIdSchema } from "../middleware/validate.js";

export const addCartItemSchema = Joi.object({
  postId: objectIdSchema,
  quantity: Joi.number().integer().min(1).max(99).optional(),
});

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(99).required(),
});

export const cartItemParamsSchema = Joi.object({
  postId: objectIdSchema,
});
