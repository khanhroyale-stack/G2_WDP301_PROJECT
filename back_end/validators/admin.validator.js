import Joi from "joi";
import { objectIdSchema } from "../middleware/validate.js";

export const adminUserIdParamsSchema = Joi.object({
  id: objectIdSchema,
});

export const adminOrderIdParamsSchema = Joi.object({
  id: objectIdSchema,
});

export const adminShipmentIdParamsSchema = Joi.object({
  id: objectIdSchema,
});

export const updateUserStatusSchema = Joi.object({
  status: Joi.string().valid("active", "banned", "unverified").required(),
});

export const assignShipperSchema = Joi.object({
  shipperId: objectIdSchema,
  deliveryFee: Joi.number().min(0).optional(),
  note: Joi.string().trim().max(500).allow("").optional(),
});

export const updateShipmentStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "assigned", "picked_up", "in_transit", "delivered", "failed", "cancelled")
    .required(),
  note: Joi.string().trim().max(500).allow("").optional(),
  proofImages: Joi.array().items(Joi.string().trim().max(500)).optional(),
});

export const adminShipmentsQuerySchema = Joi.object({
  status: Joi.string()
    .valid("pending", "assigned", "picked_up", "in_transit", "delivered", "failed", "cancelled")
    .optional(),
  shipperId: objectIdSchema.optional(),
  orderId: objectIdSchema.optional(),
  search: Joi.string().trim().max(120).optional(),
});

export const adminUsersQuerySchema = Joi.object({
  status: Joi.string().valid("active", "banned", "unverified").optional(),
  role: Joi.string().valid("user", "admin", "shipper").optional(),
  search: Joi.string().trim().max(120).optional(),
});
