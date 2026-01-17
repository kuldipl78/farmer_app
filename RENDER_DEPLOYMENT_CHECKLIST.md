# Render.com Deployment Checklist

## Pre-Deployment Checklist ✅

- [ ] Code is committed and pushed to GitHub
- [ ] `requirements.txt` includes all dependencies
- [ ] `build.sh` and `start.sh` scripts are executable
- [ ] Environment configuration is ready
- [ ] Database models are properly defined

## Render.com Setup Steps

### 1. Create Database Service
- [ ] Go to Render.com dashboard
- [ ] Click "New +" → "PostgreSQL"
- [ ] Name: `farmer-marketplace-db`
- [ ] Copy the External Database URL
- [ ] Wait for database to be ready

### 2. Create Web Service
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Set Root Directory: `backend`
- [ ] Build Command: `./build.sh`
- [ ] Start Command: `./start.sh`

### 3. Environment Variables
Add these in web service settings:
- [ ] `DATABASE_URL` = (your PostgreSQL URL)
- [ ] `DEBUG` = `False`
- [ ] `SECRET_KEY` = `Kuldip_Farmer_Marketplace_Render_Secret_2026@9764`
- [ ] `ALGORITHM` = `HS256`
- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES` = `30`
- [ ] `ALLOWED_ORIGINS` = `*`

### 4. Deploy & Test
- [ ] Click "Create Web Service"
- [ ] Monitor deployment logs
- [ ] Test health endpoint: `/health`
- [ ] Test categories endpoint: `/categories/`
- [ ] Check API docs: `/docs`

### 5. Update Mobile App
- [ ] Update API base URL in mobile app
- [ ] Test mobile app with production API
- [ ] Verify all features work

## Your Service URLs (fill after deployment)
- **Database**: `farmer-marketplace-db.render.com`
- **API**: `https://your-service-name.onrender.com`
- **API Docs**: `https://your-service-name.onrender.com/docs`

## Quick Commands for Local Testing
```bash
# Test locally before deployment
cd backend
pip install -r requirements.txt
python init_db.py
python -m uvicorn app.main:app --reload

# Test endpoints
curl http://localhost:8000/health
curl http://localhost:8000/categories/
```