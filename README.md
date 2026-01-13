# 🌾 Local Farmer-Customer Marketplace

A mobile marketplace connecting farmers directly with customers, eliminating middlemen and ensuring fair prices for both parties.

## Tech Stack

- **Backend**: FastAPI + MySQL
- **Frontend**: Expo React Native + Tailwind CSS (NativeWind)
- **Authentication**: JWT tokens
- **Database**: MySQL with proper normalization

## Project Structure

```
farmer-marketplace/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utilities
│   └── requirements.txt
├── mobile/                 # React Native app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── screens/        # App screens
│   │   ├── services/       # API services
│   │   └── utils/          # Utilities
│   └── package.json
└── database/               # Database scripts
    └── schema.sql
```

## Features

### For Farmers 👨‍🌾
- Create and manage farmer profile
- Add and manage products
- Update stock and prices
- Accept and manage orders

### For Customers 🧑
- Register and browse products
- Add products to cart
- Place and track orders
- Direct communication with farmers

### For Admins 🛠
- Verify farmers
- Monitor platform activity
- Manage disputes

## Getting Started

1. Set up the backend (FastAPI + MySQL)
2. Set up the mobile app (Expo React Native)
3. Configure environment variables
4. Run the development servers

## Security Features

- Password hashing
- JWT token authentication
- Role-based access control
- Input validation and sanitization# farmer_app
