# Network Error Fix Guide

## Problem
Mobile app shows "Network Error" when trying to register/login.

## Root Cause
Android blocks HTTP (non-HTTPS) traffic by default for security. Your local backend uses HTTP.

## ✅ Fixes Applied

### 1. Updated API URL
Changed from `192.168.1.48` to `10.129.3.210` (your current machine IP)
- File: `mobile/src/services/api.js`
- Line: `const LOCAL_URL = 'http://10.129.3.210:8001';`

### 2. Enabled Cleartext Traffic (HTTP)
Added Android configuration to allow HTTP traffic for local development
- File: `mobile/app.json`
- Added: `"usesCleartextTraffic": true`
- Added: Internet permissions

### 3. Improved Error Logging
Added better error logging in AuthContext to help debug issues
- File: `mobile/src/context/AuthContext.js`

## 🔧 Steps to Fix

### Step 1: Restart Expo Development Server
```bash
cd mobile
# Stop the current server (Ctrl+C)
# Clear cache and restart
npx expo start -c
```

### Step 2: Rebuild the App
Since we changed `app.json`, you need to rebuild:
```bash
# For Android
npx expo run:android
```

Or simply press `a` in the Expo terminal to rebuild for Android.

### Step 3: Verify Backend is Running
```bash
cd backend
python3 simple_server.py
```

Should show:
```
🚀 Server running on http://0.0.0.0:8001
🗄️  Database: SQLite
```

### Step 4: Test Connection
From your mobile device browser, try accessing:
```
http://10.129.3.210:8001/health
```

You should see: `{"status": "healthy"}`

## 🔍 Troubleshooting

### If Still Getting Network Error:

1. **Check Firewall**
   ```bash
   # On Linux, check if port 8001 is open
   sudo ufw status
   # If firewall is active, allow port 8001
   sudo ufw allow 8001
   ```

2. **Verify IP Address**
   ```bash
   hostname -I
   ```
   Make sure the IP in `api.js` matches your machine's IP.

3. **Check if Backend is Accessible**
   From another device on the same network:
   ```bash
   curl http://10.129.3.210:8001/health
   ```

4. **Check Android Logs**
   In Expo terminal, look for detailed error messages.

5. **Try Different Network**
   - Make sure both your computer and phone are on the same WiFi network
   - Some corporate/public WiFi networks block device-to-device communication

### Alternative: Use Expo Tunnel
If local network doesn't work, use Expo tunnel:
```bash
cd mobile
npx expo start --tunnel
```

This creates a public URL that works even across different networks.

## 📱 Testing Registration

After fixes, try registering with:
- Email: `newuser@example.com`
- Password: `password123`
- Role: `customer` or `farmer`
- First Name: `Test`
- Last Name: `User`

## ✅ Expected Result
Registration should succeed and you should be redirected to the appropriate screen (Home for customers, Farmer Dashboard for farmers).

## 🚨 Common Errors

### "Network Error"
- Backend not running
- Wrong IP address
- Firewall blocking connection
- Phone and computer on different networks

### "Email already registered"
- This is actually a good sign! It means the connection works.
- Try a different email address.

### "Connection timeout"
- Backend is not accessible from your phone
- Check firewall settings
- Try using Expo tunnel mode

## 📝 Notes

- The `usesCleartextTraffic: true` setting is only for development
- For production (Railway deployment), you'll use HTTPS which doesn't need this setting
- Remember to update the API URL to your Railway URL when deploying to production
