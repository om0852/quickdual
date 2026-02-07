const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    playerName: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster leaderboard queries
scoreSchema.index({ score: -1 });

module.exports = mongoose.model('Score', scoreSchema);
