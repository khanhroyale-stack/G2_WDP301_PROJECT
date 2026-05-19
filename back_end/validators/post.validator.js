import Joi from "joi";
import { objectIdSchema } from "../middleware/validate.js";

export const createPostSchema = Joi.object({
  title: Joi.string().trim().min(5).max(120).required(),
  description: Joi.string().trim().min(10).max(3000).required(),
  price: Joi.number().min(0).max(1000000000).required(),
  categoryId: objectIdSchema.optional(),
  category: Joi.string().trim().min(2).max(120).optional(),
  condition: Joi.string().valid("newLike", "good", "fair").optional(),
  brand: Joi.string().trim().max(120).allow("").optional(),
  color: Joi.string().trim().max(80).allow("").optional(),
  size: Joi.string().trim().max(80).allow("").optional(),
  locationCity: Joi.string().trim().max(120).allow("").optional(),
  locationDistrict: Joi.string().trim().max(120).allow("").optional(),
  shippingType: Joi.string().valid("pickup", "delivery", "both").optional(),
  shippingFee: Joi.number().min(0).max(100000000).optional(),
  isFreeShip: Joi.boolean().optional(),
  quantity: Joi.number().integer().min(1).max(99).optional(),
  tags: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().trim().min(1).max(40)).max(10),
      Joi.string().trim().allow("")
    )
    .optional(),
  images: Joi.array().items(Joi.string().trim().uri()).max(5).optional(),
});

export const updatePostSchema = Joi.object({
  title: Joi.string().trim().min(5).max(120).optional(),
  description: Joi.string().trim().min(10).max(3000).optional(),
  price: Joi.number().min(0).max(1000000000).optional(),
  categoryId: objectIdSchema.optional(),
  category: Joi.string().trim().min(2).max(120).optional(),
  condition: Joi.string().valid("newLike", "good", "fair").optional(),
  brand: Joi.string().trim().max(120).allow("").optional(),
  color: Joi.string().trim().max(80).allow("").optional(),
  size: Joi.string().trim().max(80).allow("").optional(),
  locationCity: Joi.string().trim().max(120).allow("").optional(),
  locationDistrict: Joi.string().trim().max(120).allow("").optional(),
  shippingType: Joi.string().valid("pickup", "delivery", "both").optional(),
  shippingFee: Joi.number().min(0).max(100000000).optional(),
  isFreeShip: Joi.boolean().optional(),
  quantity: Joi.number().integer().min(1).max(99).optional(),
  tags: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().trim().min(1).max(40)).max(10),
      Joi.string().trim().allow("")
    )
    .optional(),
  images: Joi.array().items(Joi.string().trim().uri()).max(5).optional(),
}).min(1);

export const rejectPostSchema = Joi.object({
  reason: Joi.string().trim().min(3).max(255).optional(),
});

export const postIdParamsSchema = Joi.object({
  id: objectIdSchema,
});

export const myPostsQuerySchema = Joi.object({
  status: Joi.string().valid("all", "pending", "approved", "rejected", "sold").optional(),
});

export const moderationQuerySchema = Joi.object({
  status: Joi.string().valid("all", "pending", "approved", "rejected", "sold").optional(),
  search: Joi.string().trim().max(120).optional(),
  category: Joi.string().trim().max(120).optional(),
});

export const postsPublicQuerySchema = Joi.object({
  search: Joi.string().trim().max(120).optional(),
  category: Joi.string().trim().max(120).optional(),
  status: Joi.string().valid("all", "available", "sold").optional(),
});
