const express = require('express');
const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/users');

const router = express.Router();

// Create Post
router.post('/', async (req, res) => {
  const { author, content } = req.body;
  try {
    const post = await Post.create({ author, content });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like / Unlike Post
router.post('/:id/like', async (req, res) => {
  const { userId } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (post.likes.includes(userId)) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Comment
router.post('/:id/comment', async (req, res) => {
  const { userId, content } = req.body;
  try {
    const comment = await Comment.create({ post: req.params.id, author: userId, content });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Comments for Post
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id }).populate('author', 'username');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
