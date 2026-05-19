import Joi from "joi";
import { objectIdSchema } from "../middleware/validate.js";

export const createTransactionSchema = Joi.object({
  type: Joi.string().valid("sale", "donation").required(),
  amount: Joi.number().min(1).max(1000000000).required(),
  postId: Joi.when("type", {
    is: "sale",
    then: objectIdSchema,
    otherwise: Joi.forbidden(),
  }),
  charityId: Joi.when("type", {
    is: "donation",
    then: objectIdSchema,
    otherwise: Joi.forbidden(),
  }),
  paymentMethod: Joi.string().trim().max(50).optional(),
  metadata: Joi.object().optional(),
});

export const transactionsQuerySchema = Joi.object({
  type: Joi.string().valid("sale", "donation").optional(),
  status: Joi.string().valid("pending", "paid", "failed", "refunded").optional(),
});

export const transactionIdParamsSchema = Joi.object({
  id: objectIdSchema,
});
