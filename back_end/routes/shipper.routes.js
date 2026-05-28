import express from "express";
import { authMiddleware, isShipper } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import {
  assignShipper,
  getShipperOrders,
  submitInspection,
} from "../controllers/shipper.controller.js";
import {
  shipperInspectionSchema,
  shipperOrderIdParamsSchema,
} from "../validators/shipper.validator.js";

const router = express.Router();

router.use(authMiddleware, isShipper);

router.get("/orders", getShipperOrders);
router.patch("/orders/:id/assign", validateParams(shipperOrderIdParamsSchema), assignShipper);
router.patch(
  "/orders/:id/inspection",
  validateParams(shipperOrderIdParamsSchema),
  validateBody(shipperInspectionSchema),
  submitInspection
);

export default router;
