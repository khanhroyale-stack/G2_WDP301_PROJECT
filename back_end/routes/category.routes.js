import express from "express";
import { authMiddleware, isAdmin } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/category.controller.js";
import {
  categoriesQuerySchema,
  categoryIdParamsSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validator.js";

const router = express.Router();

router.get("/", validateQuery(categoriesQuerySchema), getCategories);
router.post("/", authMiddleware, isAdmin, validateBody(createCategorySchema), createCategory);
router.put("/:id", authMiddleware, isAdmin, validateParams(categoryIdParamsSchema), validateBody(updateCategorySchema), updateCategory);
router.delete("/:id", authMiddleware, isAdmin, validateParams(categoryIdParamsSchema), deleteCategory);

export default router;
