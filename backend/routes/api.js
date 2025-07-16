const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ClaimHistory = require('../models/ClaimHistory');

/**
 * @route   GET /api/users
 * @desc    Get all users sorted by totalPoints descending
 * @access  Public
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ totalPoints: -1 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/users
 * @desc    Add a new user with unique name
 * @access  Public
 */
router.post('/users', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ msg: 'Name is required' });
  }
  try {
    let user = await User.findOne({ name });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    user = new User({ name });
    await user.save();
    res.json(user);
  } catch (err) {
    console.error('Error adding user:', err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/claim
 * @desc    Claim random points (1-10) for a user, update totalPoints, and save claim history
 * @access  Public
 */
router.post('/claim', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ msg: 'User ID is required' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    // Generate random points between 1 and 10
    const points = Math.floor(Math.random() * 10) + 1;
    user.totalPoints += points;
    await user.save();

    // Save claim history record
    const claim = new ClaimHistory({
      userId: user._id,
      points,
    });
    await claim.save();

    // Return updated user and points awarded
    res.json({ user, points });
  } catch (err) {
    console.error('Error claiming points:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
