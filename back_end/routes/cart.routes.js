import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import {
  addCartItem,
  clearCart,
  getCart,
  getCartCount,
  removeCartItem,
  updateCartItem,
} from "../controllers/cart.controller.js";
import {
  addCartItemSchema,
  cartItemParamsSchema,
  updateCartItemSchema,
} from "../validators/cart.validator.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getCart);
router.get("/count", getCartCount);
router.post("/items", validateBody(addCartItemSchema), addCartItem);
router.patch("/items/:postId", validateParams(cartItemParamsSchema), validateBody(updateCartItemSchema), updateCartItem);
router.delete("/items/:postId", validateParams(cartItemParamsSchema), removeCartItem);
router.delete("/clear", clearCart);

export default router;
