import express from "express";
import {
  register,
  login,
  verifyAccount,
  resendVerifyOtp,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  emailSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "../validators/auth.validator.js";
const router = express.Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/verify-account", validateBody(verifyOtpSchema), verifyAccount);
router.post("/resend-verify-otp", validateBody(emailSchema), resendVerifyOtp);
router.post("/login", validateBody(loginSchema), login);
router.post("/forgot-password", validateBody(emailSchema), forgotPassword);
router.post("/reset-password", validateBody(resetPasswordSchema), resetPassword);
router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, validateBody(updateProfileSchema), updateMe);

export default router;
