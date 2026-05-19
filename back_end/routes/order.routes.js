import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import {
  cancelMyOrder,
  checkoutFromCart,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import {
  checkoutFromCartSchema,
  orderIdParamsSchema,
  updateOrderStatusSchema,
} from "../validators/order.validator.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/checkout", validateBody(checkoutFromCartSchema), checkoutFromCart);
router.get("/me", getMyOrders);
router.get("/:id", validateParams(orderIdParamsSchema), getOrderById);
router.patch("/:id/status", validateParams(orderIdParamsSchema), validateBody(updateOrderStatusSchema), updateOrderStatus);
router.patch("/:id/cancel", validateParams(orderIdParamsSchema), cancelMyOrder);

export default router;
