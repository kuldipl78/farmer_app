# Render.com Deployment Guide

## Prerequisites
1. Render.com account (sign up at https://render.com)
2. GitHub repository with your code

## Step-by-Step Deployment Process

### 1. Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Connect your GitHub account

### 2. Create PostgreSQL Database
1. In Render dashboard, click "New +"
2. Select "PostgreSQL"
3. Configure database:
   - **Name**: `farmer-marketplace-db`
   - **Database**: `farmer_marketplace`
   - **User**: `farmer_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free tier is fine for testing
4. Click "Create Database"
5. **Important**: Copy the "External Database URL" - you'll need this

### 3. Create Web Service
1. In Render dashboard, click "New +"
2. Select "Web Service"
3. Connect your GitHub repository
4. Configure service:
   - **Name**: `farmer-marketplace-api`
   - **Region**: Same as your database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `./start.sh`
   - **Plan**: Free tier

### 4. Set Environment Variables
In the web service settings, add these environment variables:

```
DATABASE_URL=<your-postgresql-external-url-from-step-2>
DEBUG=False
SECRET_KEY=Kuldip_Farmer_Marketplace_Render_Secret_2026@9764
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=*
```

**Important**: Replace `<your-postgresql-external-url-from-step-2>` with the actual database URL from step 2.

### 5. Deploy
1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Run the build script (`build.sh`)
   - Install dependencies
   - Initialize the database
   - Start your application

### 6. Monitor Deployment
1. Watch the deployment logs in Render dashboard
2. Wait for "Your service is live" message
3. Your API will be available at: `https://your-service-name.onrender.com`

## Testing Your Deployment

Test these endpoints after deployment:
- `https://your-service-name.onrender.com/` - Welcome message
- `https://your-service-name.onrender.com/health` - Health check
- `https://your-service-name.onrender.com/categories/` - Get categories
- `https://your-service-name.onrender.com/docs` - API documentation

## Database Schema
The application automatically creates these tables:
- `users` - User accounts (farmers, customers, admins)
- `farmer_profiles` - Farmer-specific information
- `customer_profiles` - Customer-specific information
- `categories` - Product categories (auto-populated)
- `products` - Farmer products
- `orders` - Customer orders
- `order_items` - Individual order items
- `reviews` - Product/farmer reviews

## Sample Data
The deployment automatically adds sample categories:
- Vegetables, Fruits, Herbs, Grains, Dairy, Eggs, Meat, Honey

## Updating Your Mobile App
After successful deployment, update your mobile app configuration:

In `mobile/src/services/api.js`:
```javascript
const RENDER_URL = 'https://your-actual-service-name.onrender.com';
// Update the getBaseURL() function to use RENDER_URL
```

## Troubleshooting

### Common Issues:
1. **Build fails**: Check that all dependencies are in `requirements.txt`
2. **Database connection fails**: Verify `DATABASE_URL` is correct
3. **App won't start**: Check the start command and logs
4. **CORS errors**: Verify `ALLOWED_ORIGINS` includes your frontend URL

### Checking Logs:
1. Go to your web service in Render dashboard
2. Click "Logs" tab to see real-time logs
3. Look for error messages during build or runtime

### Database Issues:
1. Ensure PostgreSQL service is running
2. Check database URL format: `postgresql://user:password@host:port/database`
3. Verify database tables were created (check logs for "Database tables created successfully!")

## Production Considerations

### Security:
- Change `SECRET_KEY` to a strong, unique value
- Restrict `ALLOWED_ORIGINS` to your actual frontend domains
- Set `DEBUG=False` in production

### Performance:
- Consider upgrading to paid plans for better performance
- Monitor resource usage in Render dashboard
- Add database indexes for frequently queried fields

### Monitoring:
- Set up health checks
- Monitor response times
- Set up alerts for downtime

## Local Development vs Production
- **Local**: Uses SQLite database (`farmer_marketplace.db`)
- **Production**: Uses PostgreSQL (via `DATABASE_URL`)
- **Environment**: Automatically detected based on `DATABASE_URL` presence