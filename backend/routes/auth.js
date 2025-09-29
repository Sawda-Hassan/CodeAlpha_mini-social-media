// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

const router = express.Router();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';

// helper: safe JSON error response
function jsonError(res, status, message) {
  return res.status(status).json({ message });
}

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body || {};
    if (!username || !email || !password) return jsonError(res, 400, 'username, email and password are required');

    // check existing
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) return jsonError(res, 400, 'Username or email already exists');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ username, email, password: passwordHash, displayName });
    await user.save();

    // sign tokens
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // persist refresh token (optional)
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(201).json({
      token,
      refreshToken,
      user: { id: user._id, username: user.username, email: user.email, displayName: user.displayName }
    });
  } catch (err) {
    console.error('Register error:', err);
    return jsonError(res, 500, 'Server error during registration');
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password, email } = req.body || {};
    // support emailOrUsername or email field for compatibility
    const lookup = emailOrUsername || email;
    if (!lookup || !password) return jsonError(res, 400, 'emailOrUsername (or email) and password are required');

    const user = await User.findOne({ $or: [{ email: lookup }, { username: lookup }] });
    if (!user) return jsonError(res, 400, 'Invalid credentials');

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return jsonError(res, 400, 'Invalid credentials');

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    return res.json({
      token, refreshToken,
      user: { id: user._id, username: user.username, email: user.email, displayName: user.displayName }
    });
  } catch (err) {
    console.error('Login error:', err);
    return jsonError(res, 500, 'Server error during login');
  }
});

// REFRESH
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) return jsonError(res, 400, 'Missing refreshToken');

    let payload;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      return jsonError(res, 401, 'Invalid refresh token');
    }

    const user = await User.findById(payload.id);
    if (!user) return jsonError(res, 401, 'User not found');
    if (!user.refreshToken || user.refreshToken !== refreshToken) return jsonError(res, 401, 'Refresh token not recognized');

    const newToken = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token: newToken });
  } catch (err) {
    console.error('Refresh error:', err);
    return jsonError(res, 500, 'Server error during token refresh');
  }
});

module.exports = router;
