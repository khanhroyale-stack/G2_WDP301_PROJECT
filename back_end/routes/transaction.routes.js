import express from "express";
import {
  createTransaction,
  confirmManualTransaction,
  getMyTransactions,
  getAllTransactions,
} from "../controllers/transaction.controller.js";
import { authMiddleware, isAdmin } from "../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import {
  createTransactionSchema,
  transactionIdParamsSchema,
  transactionsQuerySchema,
} from "../validators/transaction.validator.js";

const router = express.Router();

router.post("/", authMiddleware, validateBody(createTransactionSchema), createTransaction);
router.patch("/:id/confirm-manual", authMiddleware, validateParams(transactionIdParamsSchema), confirmManualTransaction);
router.get("/me", authMiddleware, getMyTransactions);
router.get("/", authMiddleware, isAdmin, validateQuery(transactionsQuerySchema), getAllTransactions);

export default router;
