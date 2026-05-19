import Joi from "joi";

export const registerSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).max(72).required(),
  full_name: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9+\-()\s]{8,20}$/)
    .required(),
  address: Joi.string().trim().min(3).max(255).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(6).max(72).required(),
});

export const emailSchema = Joi.object({
  email: Joi.string().trim().email().required(),
});

export const verifyOtpSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  otp: Joi.string().trim().pattern(/^\d{6}$/).required(),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  otp: Joi.string().trim().pattern(/^\d{6}$/).required(),
  newPassword: Joi.string().min(6).max(72).required(),
});

export const updateProfileSchema = Joi.object({
  full_name: Joi.string().trim().min(2).max(100).optional(),
  phone: Joi.string().trim().pattern(/^[0-9+\-()\s]{8,20}$/).optional(),
  address: Joi.string().trim().min(3).max(255).optional(),
}).min(1);
