import Joi from "joi";
import { objectIdSchema } from "../middleware/validate.js";

export const orderIdParamsSchema = Joi.object({
  id: objectIdSchema,
});

export const checkoutFromCartSchema = Joi.object({
  addressId: objectIdSchema.optional(),
  note: Joi.string().trim().max(500).allow("").optional(),
  paymentMethod: Joi.string().valid("manual").optional(),
});

export const updateOrderStatusSchema = Joi.object({
  orderStatus: Joi.string().valid("pending", "confirmed", "shipping", "completed", "cancelled").optional(),
  paymentStatus: Joi.string().valid("pending", "paid", "failed", "refunded").optional(),
}).min(1);
