import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import {
  createAddress,
  deleteAddress,
  getMyAddresses,
  updateAddress,
} from "../controllers/address.controller.js";
import {
  addressIdParamsSchema,
  createAddressSchema,
  updateAddressSchema,
} from "../validators/address.validator.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getMyAddresses);
router.post("/", validateBody(createAddressSchema), createAddress);
router.put("/:id", validateParams(addressIdParamsSchema), validateBody(updateAddressSchema), updateAddress);
router.delete("/:id", validateParams(addressIdParamsSchema), deleteAddress);

export default router;
