import express from "express";
import {
  getAdminStats,
  getUsersForAdmin,
  updateUserStatus,
} from "../controllers/admin.controller.js";
import { authMiddleware, isAdmin } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import {
  adminUsersQuerySchema,
  adminUserIdParamsSchema,
  updateUserStatusSchema,
} from "../validators/admin.validator.js";

const router = express.Router();

router.get("/stats", authMiddleware, isAdmin, getAdminStats);
router.get("/users", authMiddleware, isAdmin, validateQuery(adminUsersQuerySchema), getUsersForAdmin);
router.patch("/users/:id/status", authMiddleware, isAdmin, validateParams(adminUserIdParamsSchema), validateBody(updateUserStatusSchema), updateUserStatus);

export default router;
