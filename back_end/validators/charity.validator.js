import Joi from "joi";
import { objectIdSchema } from "../middleware/validate.js";

export const charityIdParamsSchema = Joi.object({
  id: objectIdSchema,
});

export const createCharitySchema = Joi.object({
  title: Joi.string().trim().min(5).max(150).required(),
  description: Joi.string().trim().min(20).max(5000).required(),
  goalAmount: Joi.number().min(0).max(100000000000).optional(),
});

export const updateCharitySchema = Joi.object({
  title: Joi.string().trim().min(5).max(150).optional(),
  description: Joi.string().trim().min(20).max(5000).optional(),
  goalAmount: Joi.number().min(0).max(100000000000).optional(),
  status: Joi.string().valid("active", "closed").optional(),
}).min(1);

export const donateSchema = Joi.object({
  donorName: Joi.string().trim().min(2).max(100).optional(),
  amount: Joi.number().min(1).max(1000000000).required(),
  message: Joi.string().trim().max(500).allow("").optional(),
});
