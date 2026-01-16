# 🌾 Farmer Marketplace Setup Guide

This guide will help you set up and run the Local Farmer-Customer Marketplace application.

## Prerequisites

- **Python 3.8+** (for backend)
- **Node.js 16+** (for mobile app)
- **MySQL 8.0+** (for database)
- **Expo CLI** (for React Native development)

## 🗄️ Database Setup

1. **Install MySQL** and create the database:
```sql
CREATE DATABASE farmer_marketplace;
CREATE USER 'farmer_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON farmer_marketplace.* TO 'farmer_user'@'localhost';
FLUSH PRIVILEGES;
```

2. **Run the database schema**:
```bash
mysql -u farmer_user -p farmer_marketplace < database/schema.sql
```

## 🚀 Backend Setup (FastAPI)

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Create environment file**:
```bash
cp .env.example .env
```

5. **Update `.env` file** with your database credentials:
```env
DATABASE_URL=mysql+pymysql://farmer_user:your_password@localhost:3306/farmer_marketplace
SECRET_KEY=your-super-secret-key-change-this-in-production
DEBUG=True
```

6. **Run the backend server**:
```bash
python -m app.main
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

## 📱 Mobile App Setup (React Native + Expo)

1. **Install Expo CLI globally**:
```bash
npm install -g @expo/cli
```

2. **Navigate to mobile directory**:
```bash
cd mobile
```

3. **Install dependencies**:
```bash
npm install
```

4. **Update API URL** in `src/services/api.js`:
```javascript
// For development with physical device, use your computer's IP
const BASE_URL = 'http://YOUR_IP_ADDRESS:8000';
// For emulator/simulator, use localhost
const BASE_URL = 'http://localhost:8000';
```

5. **Start the development server**:
```bash
npm start
```

6. **Run on device/emulator**:
- **iOS Simulator**: Press `i` in terminal or scan QR code with Camera app
- **Android Emulator**: Press `a` in terminal or scan QR code with Expo Go app
- **Physical Device**: Install Expo Go app and scan QR code

## 🧪 Testing the Application

### Backend API Testing

1. **Test health endpoint**:
```bash
curl http://localhost:8000/health
```

2. **Register a test user**:
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@test.com",
    "password": "password123",
    "role": "farmer",
    "first_name": "John",
    "last_name": "Farmer"
  }'
```

3. **Login and get token**:
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@test.com",
    "password": "password123"
  }'
```

### Mobile App Testing

1. **Register as Customer**: Test the registration flow
2. **Register as Farmer**: Test farmer-specific features
3. **Browse Products**: Test product listing and search
4. **Place Orders**: Test the order creation process

## 🔧 Development Tips

### Backend Development

- **Auto-reload**: The server automatically reloads on code changes when `DEBUG=True`
- **Database migrations**: Use Alembic for database schema changes
- **API testing**: Use the interactive docs at `/docs` for testing endpoints

### Mobile Development

- **Hot reload**: Changes are automatically reflected in the app
- **Debugging**: Use React Native Debugger or browser dev tools
- **Styling**: Uses NativeWind (Tailwind CSS for React Native)

## 📁 Project Structure

```
farmer-marketplace/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routes/         # API endpoints
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── utils/          # Utilities (auth, etc.)
│   │   └── main.py         # FastAPI app
│   └── requirements.txt
├── mobile/                 # React Native app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── screens/        # App screens
│   │   ├── navigation/     # Navigation setup
│   │   ├── context/        # React contexts
│   │   └── services/       # API services
│   └── package.json
├── database/               # Database scripts
│   └── schema.sql
└── README.md
```

## 🚨 Common Issues

### Backend Issues

1. **Database connection error**: Check MySQL is running and credentials are correct
2. **Import errors**: Ensure virtual environment is activated
3. **Port already in use**: Change port in `config.py` or kill existing process

### Mobile Issues

1. **Metro bundler issues**: Clear cache with `npx expo start --clear`
2. **Network errors**: Ensure backend is running and API URL is correct
3. **Styling issues**: Restart Metro bundler after Tailwind changes

## 🔐 Security Notes

- Change the `SECRET_KEY` in production
- Use environment variables for sensitive data
- Implement proper input validation
- Use HTTPS in production
- Regularly update dependencies

## 📈 Next Steps

1. **Add image upload** for products
2. **Implement real-time notifications**
3. **Add payment integration**
4. **Implement geolocation features**
5. **Add review and rating system**
6. **Create admin dashboard**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues:
1. Check this setup guide
2. Review the error logs
3. Check the API documentation at `/docs`
4. Create an issue in the repository