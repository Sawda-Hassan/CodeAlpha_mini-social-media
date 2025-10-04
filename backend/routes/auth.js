const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const  Post= require( "../models/post.js");
const Follow = require("../models/follow");
const router = express.Router();

// Helper: generate JWT
function generateToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "1h" }
  );
}

// @route   POST /api/auth/register
// @desc    Register new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: user.toProfileJSON(),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken(user);
    res.json({ token, user: user.toProfileJSON() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @route   PUT /api/auth/profile/:id
// @desc    Update user profile// GET /api/auth/profile/:id
router.get("/profile/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Count posts created by this user
    const postsCount = await Post.countDocuments({ author: userId });

    // Count followers (users who follow this user)
    const followersCount = await Follow.countDocuments({ following: userId });

    // Count following (users this user follows)
    const followingCount = await Follow.countDocuments({ follower: userId });

    // Return full profile info
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
      profilePic: user.profilePic,
      followersCount,
      followingCount,
      postsCount,
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Error fetching profile" });
  }
});
module.exports = router;
