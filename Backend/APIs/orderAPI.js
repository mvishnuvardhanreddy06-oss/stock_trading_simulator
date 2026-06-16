import { Router } from "express";
import { executeMarketOrder } from "../utils/orderMatching.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const result = await executeMarketOrder({ ...req.body, owner: req.user.id });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
