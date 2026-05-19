import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { addFavorite, getMyFavorites, removeFavorite } from "../controllers/favorite.controller.js";
import { addFavoriteSchema, favoritePostParamsSchema } from "../validators/favorite.validator.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getMyFavorites);
router.post("/", validateBody(addFavoriteSchema), addFavorite);
router.delete("/:postId", validateParams(favoritePostParamsSchema), removeFavorite);

export default router;
