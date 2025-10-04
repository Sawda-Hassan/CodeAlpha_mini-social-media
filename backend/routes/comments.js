const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Comment = require("../models/comment");
const Post = require("../models/post");

// ------------------------------
// CREATE COMMENT
// ------------------------------
router.post("/", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");

    const { postId, content } = req.body;
    if (!postId || !content) {
      return res.status(400).json({ message: "postId and content are required" });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = new Comment({
      post: postId,
      author: payload.id,
      content,
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ message: "Error creating comment" });
  }
});

// ------------------------------
// GET COMMENTS BY POST ID
// ------------------------------
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "username displayName profilePic")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error("Error loading comments:", err);
    res.status(500).json({ message: "Error loading comments" });
  }
});

module.exports = router;
