# Deploying QuickQual Server to Render.com

This guide will help you deploy the QuickQual backend server for free using Render.com.

## Prerequisites
- A GitHub account.
- Your project pushed to a GitHub repository.

## Step 1: Push Code to GitHub
1. Initialize git if you haven't:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. Create a new repository on GitHub.
3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Create a Web Service on Render
1. Log in to [dashboard.render.com](https://dashboard.render.com/).
2. Click **"New +"** and select **"Web Service"**.
3. Connect your GitHub account and select your `QuickQual` repository.
4. Configure the service:
   - **Name**: `quickqual-api` (or similar)
   - **Region**: Closest to you (e.g., Singapore, Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: `server` (Important! This tells Render the backend is in the `server` folder)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: Free

## Step 3: Configure Environment Variables
Scroll down to "Environment Variables" and add these keys (copy from your `.env` file):

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://smartcoder0852:zVWbXMnVgt7dnP0U@cluster0.lfofxmp.mongodb.net/quickqual` |
| `JWT_SECRET` | `quickqual_super_secret_key_2024` |
| `PORT` | `3000` (Render will override this internally, but good to have) |

## Step 4: Deploy
1. Click **"Create Web Service"**.
2. Wait for the deployment to finish. You should see "Server running on port..." in the logs.
3. Copy your new **Service URL** (e.g., `https://quickqual-api.onrender.com`).

## Step 5: Connect Frontend
1. Open `src/config.js` in your local project.
2. Update the `API_URL` to your new Render URL:
   ```javascript
   export const API_URL = 'https://quickqual-api.onrender.com/api';
   ```
3. Save and refresh your game. It is now connected to the cloud! ☁️
