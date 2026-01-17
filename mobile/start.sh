#!/bin/bash

# Mobile App Startup Script
echo "Starting React Native Mobile App..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the React Native development server
echo "Starting Metro bundler..."
npx react-native start