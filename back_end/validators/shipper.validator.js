import Joi from "joi";
import { objectIdSchema } from "../middleware/validate.js";

export const shipperOrderIdParamsSchema = Joi.object({
  id: objectIdSchema,
});

export const shipperInspectionSchema = Joi.object({
  decision: Joi.string().valid("approved", "rejected").required(),
  note: Joi.string().trim().max(500).allow("").optional(),
}).required();
