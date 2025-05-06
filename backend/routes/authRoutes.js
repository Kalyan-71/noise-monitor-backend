const express = require('express');
const router = express.Router();
const { signup, login ,logout} = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User'); // ✅ adjust the path as needed

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
// Add in authRoutes.js or separate route


router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch user' });
  }
});

  
module.exports = router;
