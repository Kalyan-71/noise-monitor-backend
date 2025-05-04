const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Signup
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashed });

    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    res
      .cookie('token', token, {
        httpOnly: true,
        sameSite: 'strict',
        secure: false, // set true in production
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({ message: 'Login successful' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token').json({ message: 'Logged out' });
});

// ✅ Auth check
router.get('/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ id: decoded.id });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
