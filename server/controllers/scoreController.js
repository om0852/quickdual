const Score = require('../models/Score');

// @desc    Get leaderboard (top 10 scores)
// @route   GET /api/scores/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
    try {
        const scores = await Score.find()
            .sort({ score: -1 })
            .limit(10)
            .select('playerName score createdAt');

        res.json({
            success: true,
            data: scores
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Submit a score
// @route   POST /api/scores/submit
// @access  Private
exports.submitScore = async (req, res) => {
    try {
        const { score } = req.body;

        if (typeof score !== 'number' || score < 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid score'
            });
        }

        const newScore = await Score.create({
            user: req.user._id,
            playerName: req.body.playerName || req.user.name,
            score
        });

        res.status(201).json({
            success: true,
            data: {
                id: newScore._id,
                playerName: newScore.playerName,
                score: newScore.score,
                createdAt: newScore.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get user's best score
// @route   GET /api/scores/my-best
// @access  Private
exports.getMyBestScore = async (req, res) => {
    try {
        const bestScore = await Score.findOne({ user: req.user._id })
            .sort({ score: -1 });

        res.json({
            success: true,
            data: bestScore || null
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
