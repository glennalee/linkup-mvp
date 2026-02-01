import express from "express";
import User from "../models/User.js";

const router = express.Router();

/**
 * GET /users
 * Optional: /users?email=xxx
 */
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;

    if (email) {
      const user = await User.findOne({ email: email.toLowerCase().trim() })
        .select("_id name email role");
      return res.json(user ? [user] : []);
    }

    const users = await User.find().select("_id name email role").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("GET /users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /users/:id (fetch latest user role)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("_id name email role");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("GET /users/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /users
 * Create a user (signup)
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const cleanedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: cleanedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const savedUser = await User.create({
      name: name.trim(),
      email: cleanedEmail,
      role,
    });

    // return safe response
    res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
    });
  } catch (error) {
    console.error("POST /users error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
