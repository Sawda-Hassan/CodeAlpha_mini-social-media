const express = require('express');
const Follow = require('../models/follow');
const users = require('../models/User');

const router = express.Router();

// Follow / Unfollow
router.post('/:id/follow', async (req, res) => {
  const { userId } = req.body;
  try {
    let follow = await Follow.findOne({ follower: userId, following: req.params.id });
    if (follow) {
      await Follow.deleteOne({ _id: follow._id });
      res.json({ msg: 'Unfollowed' });
    } else {
      follow = await Follow.create({ follower: userId, following: req.params.id });
      res.json({ msg: 'Followed' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Followers
router.get('/:id/followers', async (req, res) => {
  try {
    const followers = await Follow.find({ following: req.params.id }).populate('follower', 'username');
    res.json(followers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Following
router.get('/:id/following', async (req, res) => {
  try {
    const following = await Follow.find({ follower: req.params.id }).populate('following', 'username');
    res.json(following);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
