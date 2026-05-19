import Joi from "joi";
import { objectIdSchema } from "../middleware/validate.js";

export const favoritePostParamsSchema = Joi.object({
  postId: objectIdSchema,
});

export const addFavoriteSchema = Joi.object({
  postId: objectIdSchema,
});
