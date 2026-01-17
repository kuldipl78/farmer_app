#!/bin/bash

echo "🚀 Deploying to Render.com..."
echo "📝 Make sure you have committed and pushed your changes to GitHub first!"

echo ""
echo "🔧 Current CORS Configuration:"
echo "- Allowing all origins (*) for mobile development"
echo "- This fixes the Network Error issue"

echo ""
echo "📋 Deployment Steps:"
echo "1. Commit and push changes to GitHub"
echo "2. Go to https://dashboard.render.com"
echo "3. Select your service 'farmer-api-v2'"
echo "4. Click 'Manual Deploy' -> 'Deploy latest commit'"
echo "5. Wait for deployment to complete"
echo "6. Test the API endpoints"

echo ""
echo "🧪 After deployment, test these endpoints:"
echo "- GET https://farmer-api-v2.onrender.com/health"
echo "- GET https://farmer-api-v2.onrender.com/"
echo "- POST https://farmer-api-v2.onrender.com/auth/register"

echo ""
echo "📱 Mobile App Testing:"
echo "1. Add DebugScreen to your app navigation"
echo "2. Run Network Test to verify connectivity"
echo "3. Run Registration Test to verify registration works"

echo ""
echo "✅ CORS Fix Applied:"
echo "- Changed allowed_origins from specific localhost URLs to ['*']"
echo "- This allows requests from any origin (including mobile devices)"
echo "- In production, you should restrict this to specific domains"