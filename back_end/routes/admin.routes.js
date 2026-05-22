import express from "express";
import {
  getAdminStats,
  getUsersForAdmin,
  getShipmentsForAdmin,
  assignShipperToOrder,
  updateShipmentStatus,
  updateUserStatus,
} from "../controllers/admin.controller.js";
import { authMiddleware, isAdmin } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import {
  adminUsersQuerySchema,
  adminUserIdParamsSchema,
  adminOrderIdParamsSchema,
  adminShipmentIdParamsSchema,
  adminShipmentsQuerySchema,
  assignShipperSchema,
  updateUserStatusSchema,
  updateShipmentStatusSchema,
} from "../validators/admin.validator.js";

const router = express.Router();

router.get("/stats", authMiddleware, isAdmin, getAdminStats);
router.get("/users", authMiddleware, isAdmin, validateQuery(adminUsersQuerySchema), getUsersForAdmin);
router.patch("/users/:id/status", authMiddleware, isAdmin, validateParams(adminUserIdParamsSchema), validateBody(updateUserStatusSchema), updateUserStatus);
router.get("/shipments", authMiddleware, isAdmin, validateQuery(adminShipmentsQuerySchema), getShipmentsForAdmin);
router.post("/orders/:id/assign-shipper", authMiddleware, isAdmin, validateParams(adminOrderIdParamsSchema), validateBody(assignShipperSchema), assignShipperToOrder);
router.patch("/shipments/:id/status", authMiddleware, isAdmin, validateParams(adminShipmentIdParamsSchema), validateBody(updateShipmentStatusSchema), updateShipmentStatus);

export default router;
