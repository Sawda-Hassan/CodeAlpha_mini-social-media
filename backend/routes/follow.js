const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Follow = require("../models/follow");
const User = require("../models/users");

// ------------------------------
// FOLLOW A USER
// ------------------------------
router.post("/", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (userId === payload.id) return res.status(400).json({ message: "You can't follow yourself" });

    const existing = await Follow.findOne({ follower: payload.id, following: userId });
    if (existing) return res.status(400).json({ message: "Already following this user" });

    const follow = new Follow({ follower: payload.id, following: userId });
    await follow.save();

    res.status(201).json({ message: "User followed successfully" });
  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({ message: "Error following user" });
  }
});

// ------------------------------
// UNFOLLOW A USER
// ------------------------------
router.delete("/:userId", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");

    const { userId } = req.params;

    const result = await Follow.deleteOne({ follower: payload.id, following: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "You are not following this user" });
    }

    res.json({ message: "Unfollowed successfully" });
  } catch (err) {
    console.error("Unfollow error:", err);
    res.status(500).json({ message: "Error unfollowing user" });
  }
});

// ------------------------------
// GET FOLLOWERS OF A USER
// ------------------------------
router.get("/followers/:userId", async (req, res) => {
  try {
    const followers = await Follow.find({ following: req.params.userId }).populate("follower", "username profilePic");
    res.json(followers.map(f => f.follower));
  } catch (err) {
    console.error("Followers error:", err);
    res.status(500).json({ message: "Error loading followers" });
  }
});

// ------------------------------
// GET FOLLOWING OF A USER
// ------------------------------
router.get("/following/:userId", async (req, res) => {
  try {
    const following = await Follow.find({ follower: req.params.userId }).populate("following", "username profilePic");
    res.json(following.map(f => f.following));
  } catch (err) {
    console.error("Following error:", err);
    res.status(500).json({ message: "Error loading following" });
  }
});

module.exports = router;
