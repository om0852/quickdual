const express = require('express');
const router = express.Router();
const { getLeaderboard, submitScore, getMyBestScore } = require('../controllers/scoreController');
const { protect } = require('../middleware/auth');

// Public route - anyone can view leaderboard
router.get('/leaderboard', getLeaderboard);

// Protected routes - only authenticated users
router.post('/submit', protect, submitScore);
router.get('/my-best', protect, getMyBestScore);

module.exports = router;
