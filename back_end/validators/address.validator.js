import Joi from "joi";
import { objectIdSchema } from "../middleware/validate.js";

export const addressIdParamsSchema = Joi.object({
  id: objectIdSchema,
});

export const createAddressSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(120).required(),
  phone: Joi.string().trim().min(8).max(20).required(),
  province: Joi.string().trim().min(2).max(120).required(),
  district: Joi.string().trim().min(2).max(120).required(),
  ward: Joi.string().trim().min(1).max(120).required(),
  street: Joi.string().trim().min(2).max(255).required(),
  note: Joi.string().trim().max(255).allow("").optional(),
  isDefault: Joi.boolean().optional(),
});

export const updateAddressSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(120).optional(),
  phone: Joi.string().trim().min(8).max(20).optional(),
  province: Joi.string().trim().min(2).max(120).optional(),
  district: Joi.string().trim().min(2).max(120).optional(),
  ward: Joi.string().trim().min(1).max(120).optional(),
  street: Joi.string().trim().min(2).max(255).optional(),
  note: Joi.string().trim().max(255).allow("").optional(),
  isDefault: Joi.boolean().optional(),
}).min(1);
