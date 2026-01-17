# Backend Deployment Fix Guide

## Current Issue
The backend API at `https://farmer-api-v2.onrender.com` is returning HTTP 503 (Service Unavailable), which means the service is down or failed to start.

## Step-by-Step Fix

### 1. Check Render Dashboard
1. Go to https://dashboard.render.com
2. Find your service "farmer-api-v2"
3. Click on it to see the status
4. Check the "Logs" tab for error messages

### 2. Redeploy the Backend

#### Option A: Manual Redeploy (Recommended)
1. In Render dashboard, go to your service
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to complete
4. Check logs for any errors

#### Option B: Push Changes to Trigger Auto-Deploy
```bash
cd backend
git add .
git commit -m "Fix backend startup issues"
git push origin main
```

### 3. Files Updated for Better Deployment

I've created/updated these files to help with deployment:

1. **`backend/test_startup.py`** - Tests all imports and connections before starting
2. **`backend/start.sh`** - Improved startup script with better error handling
3. **`mobile/src/utils/apiHealthCheck.js`** - Utility to test API health
4. **`mobile/src/components/ApiHealthChecker.js`** - React component to test API

### 4. Test the Deployment

After redeployment, test using one of these methods:

#### Method 1: Browser Test
Open these URLs in your browser:
- https://farmer-api-v2.onrender.com/health
- https://farmer-api-v2.onrender.com/
- https://farmer-api-v2.onrender.com/docs

#### Method 2: Mobile App Test
Add the ApiHealthChecker component to your app temporarily:

```javascript
// In your App.js or a test screen
import ApiHealthChecker from './src/components/ApiHealthChecker';

// Add this component to test
<ApiHealthChecker />
```

### 5. Common Issues and Solutions

#### Issue: Database Connection Failed
**Solution:** Check if DATABASE_URL environment variable is set correctly in Render dashboard.

#### Issue: Import Errors
**Solution:** Check the logs for specific import failures and fix missing dependencies.

#### Issue: Port Binding Failed
**Solution:** Ensure the start script uses `$PORT` environment variable.

#### Issue: Timeout During Startup
**Solution:** Reduce workers to 1 in start.sh (already done).

### 6. Environment Variables to Check

Make sure these are set in Render dashboard:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key
- `PORT` - Should be automatically set by Render

### 7. Expected Behavior After Fix

✅ **Health endpoint** should return: `{"status": "healthy"}`
✅ **Root endpoint** should return API welcome message
✅ **Categories endpoint** should return list of categories
✅ **Registration** should work without Network Error

### 8. Mobile App Fix

Once backend is working, your mobile app should automatically work because the API configuration is already correct:

```javascript
const RENDER_URL = 'https://farmer-api-v2.onrender.com';
```

### 9. Verification Steps

1. **Backend Health Check:**
   ```bash
   curl https://farmer-api-v2.onrender.com/health
   ```
   Should return: `{"status":"healthy"}`

2. **Mobile App Test:**
   - Try registering a new account
   - Should get success or specific error (not Network Error)

3. **API Documentation:**
   - Visit: https://farmer-api-v2.onrender.com/docs
   - Should show FastAPI documentation

### 10. If Still Not Working

1. **Check Render Logs:**
   - Look for specific error messages
   - Check if database connection is failing
   - Look for import or dependency errors

2. **Try Local Testing:**
   ```bash
   cd backend
   python test_startup.py
   ```

3. **Contact Support:**
   - If all else fails, check Render's status page
   - Consider creating a new service if the current one is corrupted

## Quick Commands

```bash
# Test backend locally
cd backend
python test_startup.py

# Check API health (after deployment)
curl https://farmer-api-v2.onrender.com/health

# View logs (if you have Render CLI)
render logs -s farmer-api-v2
```

## Next Steps After Backend is Fixed

1. Remove debug components from mobile app
2. Test registration functionality
3. Test other API endpoints
4. Monitor for any other issues

The Network Error should be resolved once the backend service is running properly on Render.