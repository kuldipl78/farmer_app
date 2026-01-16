# Railway Deployment Guide

## Prerequisites
1. Railway account (sign up at https://railway.app)
2. Railway CLI installed (optional but recommended)

## Deployment Steps

### 1. Create Railway Project
1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Choose "Deploy from GitHub repo" or "Empty Project"

### 2. Add PostgreSQL Database
1. In your Railway project dashboard
2. Click "New Service" → "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL database
4. The `DATABASE_URL` environment variable will be automatically set

### 3. Deploy Backend Service
1. Click "New Service" → "GitHub Repo" (if not already connected)
2. Select your repository
3. Set the root directory to `/backend` if needed
4. Railway will automatically detect Python and install dependencies

### 4. Environment Variables
Railway will automatically set:
- `DATABASE_URL` (from PostgreSQL service)
- `PORT` (Railway assigns this)

You can add additional variables in the Railway dashboard:
- `DEBUG=False`
- `ALLOWED_ORIGINS=*` (or your specific frontend URLs)

### 5. Custom Domain (Optional)
1. In Railway dashboard, go to your backend service
2. Click "Settings" → "Domains"
3. Add a custom domain or use the Railway-provided domain

## Database Schema
The application will automatically create the required tables on first run:
- `users` - User accounts (farmers, customers)
- `categories` - Product categories
- `products` - Farmer products

Sample data will be inserted automatically including:
- Default categories (Vegetables, Fruits, Herbs, etc.)
- Sample farmer account (email: farmer@example.com, password: password123)
- Sample products

## API Endpoints
Once deployed, your API will be available at:
- `GET /health` - Health check
- `GET /categories/` - Get all categories
- `GET /products/` - Get all products
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info

## Testing Deployment
1. Test health endpoint: `https://your-app.railway.app/health`
2. Test categories: `https://your-app.railway.app/categories/`
3. Test products: `https://your-app.railway.app/products/`

## Updating Mobile App
After deployment, update your mobile app's API configuration:

In `mobile/src/services/api.js`, change:
```javascript
const RAILWAY_URL = 'https://your-actual-railway-url.railway.app';
// Then update the return statement in getBaseURL() to use RAILWAY_URL
```

## Troubleshooting
1. Check Railway logs in the dashboard
2. Ensure DATABASE_URL is set correctly
3. Verify all dependencies are in requirements.txt
4. Check that the health endpoint responds

## Local Development vs Production
- **Local**: Uses SQLite database (farmer_marketplace.db)
- **Production**: Uses PostgreSQL (via DATABASE_URL environment variable)

The application automatically detects the environment and uses the appropriate database.