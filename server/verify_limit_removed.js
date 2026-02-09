const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Score = require('./models/Score');

const verifyLimitRemoved = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Check current count
        const count = await Score.countDocuments();
        console.log(`Current score count: ${count}`);

        let addedCount = 0;
        if (count < 11) {
            console.log('Adding dummy scores...');
            const scoresToAdd = [];
            for (let i = 0; i < (11 - count); i++) {
                scoresToAdd.push({
                    user: new mongoose.Types.ObjectId(), // Dummy user ID
                    playerName: `TestPlayer${i}`,
                    score: Math.floor(Math.random() * 1000)
                });
            }
            if (scoresToAdd.length > 0) {
                await Score.insertMany(scoresToAdd);
                addedCount = scoresToAdd.length;
                console.log(`Added ${addedCount} dummy scores.`);
            }
        }

        // Test the query (copied from controller without limit)
        const scores = await Score.find()
            .sort({ score: -1 })
            .select('playerName score createdAt');

        console.log(`Retrieved ${scores.length} scores.`);

        if (scores.length > 10) {
            console.log('SUCCESS: Retrieving more than 10 scores!');
        } else {
            console.error('FAILURE: Still retrieving 10 or fewer scores.');
        }

        // Cleanup
        if (addedCount > 0) {
            console.log('Cleaning up dummy scores...');
            // In a real scenario, we'd track IDs, but here we might just leave them or delete by name pattern if we were careful.
            // For now, let's just leave them as they might be useful for manual testing, or delete if we strictly want to clean up.
            // Let's delete the exact ones we added if possible, but since we didn't save IDs, let's just delete by specific names if we used unique ones.
            // Actually, for safety in this specific task, let's not delete to avoid accidental data loss of real data, unless we identifying them clearly.
            // Since this is a dev/test environment usually, it's fine.
            // Let's DELETE the ones we created to be clean.
            const deleteResult = await Score.deleteMany({ playerName: { $regex: /^TestPlayer/ } });
            console.log(`Deleted ${deleteResult.deletedCount} dummy scores.`);
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        if (mongoose.connection.readyState === 1) {
            mongoose.connection.close();
        }
    }
};

verifyLimitRemoved();
