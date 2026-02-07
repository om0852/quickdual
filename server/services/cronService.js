const cron = require('node-cron');

const initCronJobs = () => {
    // Run every 30 seconds
    cron.schedule('*/30 * * * * *', () => {
        console.log(`Cron Job: Server Check ${new Date().toISOString()}`);
        // Add other periodic tasks here (e.g., cleanup, stats aggregation)
    });

    console.log('Cron jobs initialized: Running every 30 seconds');
};

module.exports = initCronJobs;
