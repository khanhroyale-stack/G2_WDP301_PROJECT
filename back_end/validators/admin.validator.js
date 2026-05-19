import Joi from "joi";
import { objectIdSchema } from "../middleware/validate.js";

export const adminUserIdParamsSchema = Joi.object({
  id: objectIdSchema,
});

export const updateUserStatusSchema = Joi.object({
  status: Joi.string().valid("active", "banned", "unverified").required(),
});

export const adminUsersQuerySchema = Joi.object({
  status: Joi.string().valid("active", "banned", "unverified").optional(),
  role: Joi.string().valid("user", "admin").optional(),
  search: Joi.string().trim().max(120).optional(),
});
