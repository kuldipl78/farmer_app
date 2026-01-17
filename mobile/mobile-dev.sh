#!/bin/bash

# Mobile Frontend Development Script
echo "=== Mobile Frontend Manager ==="

# Function to install dependencies
install_deps() {
    echo "Installing dependencies..."
    npm install
    echo "Dependencies installed!"
}

# Function to start development server
start_dev() {
    echo "Starting development server..."
    npx expo start
}

# Function to start with tunnel
start_tunnel() {
    echo "Starting with tunnel..."
    npx expo start --tunnel
}

# Function to build for production
build_app() {
    echo "Building app for production..."
    npx expo export
}

# Function to clear cache
clear_cache() {
    echo "Clearing cache..."
    npx expo start --clear
}

# Function to run on Android
run_android() {
    echo "Running on Android..."
    npx expo start --android
}

# Function to run on iOS
run_ios() {
    echo "Running on iOS..."
    npx expo start --ios
}

# Main menu
echo "Mobile Frontend Options:"
echo "1) Install dependencies"
echo "2) Start development server"
echo "3) Start with tunnel"
echo "4) Build for production"
echo "5) Clear cache and start"
echo "6) Run on Android"
echo "7) Run on iOS"
echo "8) Exit"

read -p "Enter choice (1-8): " choice

case $choice in
    1) install_deps ;;
    2) start_dev ;;
    3) start_tunnel ;;
    4) build_app ;;
    5) clear_cache ;;
    6) run_android ;;
    7) run_ios ;;
    8) echo "Exiting..." ;;
    *) echo "Invalid choice" ;;
esac