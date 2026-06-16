import { Router } from "express";
import { Transaction } from "../models/TransactionModel.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

export default router;
