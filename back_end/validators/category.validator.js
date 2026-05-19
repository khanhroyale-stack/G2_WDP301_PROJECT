import Joi from "joi";
import { objectIdSchema } from "../middleware/validate.js";

export const categoryIdParamsSchema = Joi.object({
  id: objectIdSchema,
});

export const categoriesQuerySchema = Joi.object({
  activeOnly: Joi.string().valid("true", "false").optional(),
});

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  slug: Joi.string().trim().min(2).max(160).optional(),
  parentId: Joi.alternatives().try(objectIdSchema, Joi.valid(null), Joi.string().allow("")).optional(),
  level: Joi.number().integer().min(1).max(5).optional(),
  isActive: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
  icon: Joi.string().trim().max(120).allow("").optional(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).optional(),
  slug: Joi.string().trim().min(2).max(160).optional(),
  parentId: Joi.alternatives().try(objectIdSchema, Joi.valid(null), Joi.string().allow("")).optional(),
  level: Joi.number().integer().min(1).max(5).optional(),
  isActive: Joi.boolean().optional(),
  sortOrder: Joi.number().integer().min(0).optional(),
  icon: Joi.string().trim().max(120).allow("").optional(),
}).min(1);
