import { Router } from "express";
import { User } from "../models/UserModel.js";
import { Portfolio } from "../models/PortfolioModel.js";
import { Watchlist } from "../models/WatchlistModel.js";
import { generateToken } from "../utils/generateToken.js";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      const error = new Error("Name, email, and password are required");
      error.status = 400;
      throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const error = new Error("Email already registered");
      error.status = 409;
      throw error;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    await user.save();

    await Portfolio.findOneAndUpdate(
      { owner: user._id.toString() },
      { $setOnInsert: { cash: Number(user.startingCash), holdings: [] } },
      { upsert: true, new: true }
    );

    await Watchlist.findOneAndUpdate(
      { owner: user._id.toString() },
      { $setOnInsert: { symbols: ["AAPL", "MSFT", "NVDA"] } },
      { upsert: true, new: true }
    );

    res.status(201).json({ user: { name: user.name, email: user.email }, token: generateToken(user) });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.status = 400;
      throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }

    // Compare password with hash
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }

    res.json({ user: { name: user.name, email: user.email }, token: generateToken(user) });
  } catch (error) {
    next(error);
  }
});

export default router;
