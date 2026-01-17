# API Testing Instructions

## What Was Fixed

The backend was failing to start due to **Pydantic v2 compatibility issues**. The error was:
```
❌ Route import failed: name 'CategoryResponse' is not defined
```

## Changes Made

1. **Updated all schema files** to use Pydantic v2 syntax:
   - `backend/app/schemas/category.py`
   - `backend/app/schemas/user.py` 
   - `backend/app/schemas/product.py`
   - `backend/app/schemas/order.py`

2. **Changed from old syntax:**
   ```python
   class Config:
       from_attributes = True
   ```
   
3. **To new Pydantic v2 syntax:**
   ```python
   model_config = ConfigDict(from_attributes=True)
   ```

## Testing Steps

### 1. Wait for Deployment
- Render will automatically redeploy after the git push
- Check https://dashboard.render.com for deployment status
- Wait for "Deploy successful" message

### 2. Test API Endpoints

#### Method A: Browser Test
Open these URLs in your browser:
- https://farmer-api-v2.onrender.com/health (should return `{"status":"healthy"}`)
- https://farmer-api-v2.onrender.com/ (should return welcome message)
- https://farmer-api-v2.onrender.com/docs (should show API documentation)

#### Method B: Mobile App Test
Add the ApiTestScreen to your app temporarily:

```javascript
// In your navigation or App.js
import ApiTestScreen from './src/screens/ApiTestScreen';

// Add to your navigation
<Stack.Screen name="ApiTest" component={ApiTestScreen} />

// Navigate to it
navigation.navigate('ApiTest');
```

### 3. Test Registration

Once the API health checks pass, try registering a new account in your mobile app:

1. Go to registration screen
2. Fill in the form:
   - Email: test@example.com
   - Password: password123
   - First Name: Test
   - Last Name: User
   - Phone: (leave empty or add a number)
   - Role: Customer

3. **Expected Results:**
   - ✅ **Success**: Account created successfully
   - ❌ **Specific Error**: If there's still an issue, you should get a specific error message (not "Network Error")

## Expected Behavior After Fix

### ✅ What Should Work Now:
- Backend starts successfully
- Health endpoint returns healthy status
- API documentation is accessible
- Registration endpoint accepts requests
- No more "Network Error" in mobile app

### 🔍 If You Still Get Errors:
- **HTTP 500**: Server-side validation or database issue
- **HTTP 400**: Invalid data format
- **HTTP 422**: Validation error
- **Specific error messages**: These are good! They tell us exactly what's wrong

## Quick Test Commands

```bash
# Test health endpoint
curl https://farmer-api-v2.onrender.com/health

# Test root endpoint  
curl https://farmer-api-v2.onrender.com/

# Test categories endpoint
curl https://farmer-api-v2.onrender.com/categories/
```

## Next Steps

1. **If API tests pass**: Try registration in your mobile app
2. **If registration works**: Remove test components and continue development
3. **If you get specific errors**: We can debug those specific issues
4. **If you still get Network Error**: Check Render logs for deployment issues

## Files Created for Testing

- `mobile/src/utils/apiHealthCheck.js` - API testing utilities
- `mobile/src/components/ApiHealthChecker.js` - React component for testing
- `mobile/src/screens/ApiTestScreen.js` - Screen wrapper for testing

## Clean Up After Testing

Once everything works, remove these test files:
- `mobile/src/screens/ApiTestScreen.js`
- `mobile/src/components/ApiHealthChecker.js`
- `mobile/src/utils/apiHealthCheck.js`
- `backend/test_startup.py`

The Network Error should be completely resolved now!