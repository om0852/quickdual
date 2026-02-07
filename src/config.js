// Configuration for QuickQual
// In production, update API_URL to point to your deployed backend URL
// Example: https://quickqual-api.onrender.com

const config = {
    // Default to local development URL
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : 'https://quickqual-api.onrender.com/api' // Placeholder, user needs to update this
};

export default config;
