const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Post = require("../models/post");

// ------------------------------
// CREATE POST
// ------------------------------
router.post("/", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");

    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const post = new Post({
      content,
      author: payload.id,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Error creating post" });
  }
});

// ------------------------------
// GET ALL POSTS
// ------------------------------
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username displayName profilePic")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ------------------------------
// GET SINGLE POST
// ------------------------------
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username displayName profilePic");
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ------------------------------
// LIKE / UNLIKE POST
// ------------------------------
router.put("/:id/like", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = payload.id;
    const index = post.likes.indexOf(userId);

    if (index === -1) {
      post.likes.push(userId); // like
    } else {
      post.likes.splice(index, 1); // unlike
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
