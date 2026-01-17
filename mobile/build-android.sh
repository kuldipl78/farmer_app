#!/bin/bash

# Android APK Builder Script
echo "=== Android APK Builder ==="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Run this from the mobile directory"
    exit 1
fi

# Function to check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."
    
    # Check if Expo CLI is available
    if ! command -v npx &> /dev/null; then
        echo "Error: npm/npx not found. Please install Node.js"
        exit 1
    fi
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
        if [ $? -ne 0 ]; then
            echo "Failed to install dependencies"
            exit 1
        fi
    fi
    
    echo "Prerequisites check passed!"
}

# Function to build development APK
build_dev_apk() {
    echo "Building development APK..."
    echo "This creates an APK that can be installed on Android devices"
    
    # Build the APK
    npx eas build --platform android --profile development --local
    
    if [ $? -eq 0 ]; then
        echo "✅ Development APK built successfully!"
        echo "Look for the .apk file in the current directory"
    else
        echo "❌ Build failed. Trying alternative method..."
        build_expo_apk
    fi
}

# Function to build using Expo build service
build_expo_apk() {
    echo "Building APK using Expo build service..."
    
    # Login to Expo (if not already logged in)
    echo "You may need to login to Expo..."
    npx expo login
    
    # Build APK
    npx expo build:android -t apk
    
    if [ $? -eq 0 ]; then
        echo "✅ APK built successfully!"
        echo "Download link will be provided by Expo"
    else
        echo "❌ Build failed"
        exit 1
    fi
}

# Function to create standalone APK
build_standalone() {
    echo "Creating standalone APK..."
    echo "This may take several minutes..."
    
    # Create standalone build
    npx expo export
    npx expo build:android -t apk --no-publish
    
    echo "Standalone APK creation completed!"
}

# Function to setup EAS (recommended)
setup_eas() {
    echo "Setting up EAS Build (recommended for production)..."
    
    # Install EAS CLI
    npm install -g @expo/eas-cli
    
    # Initialize EAS
    npx eas build:configure
    
    echo "EAS setup completed!"
    echo "Now you can run: npx eas build --platform android"
}

# Main menu
echo "Android Build Options:"
echo "1) Build development APK (recommended)"
echo "2) Build using Expo service"
echo "3) Build standalone APK"
echo "4) Setup EAS Build (for production)"
echo "5) Check prerequisites only"
echo "6) Exit"

read -p "Enter choice (1-6): " choice

case $choice in
    1) 
        check_prerequisites
        build_dev_apk
        ;;
    2) 
        check_prerequisites
        build_expo_apk
        ;;
    3) 
        check_prerequisites
        build_standalone
        ;;
    4) 
        setup_eas
        ;;
    5) 
        check_prerequisites
        ;;
    6) 
        echo "Exiting..."
        ;;
    *) 
        echo "Invalid choice"
        ;;
esac

echo ""
echo "📱 APK Installation Tips:"
echo "1. Enable 'Unknown Sources' in Android settings"
echo "2. Transfer APK to device via USB/email/cloud"
echo "3. Tap APK file to install"
echo "4. If 'App not installed' error occurs:"
echo "   - Check if package name conflicts with existing app"
echo "   - Uninstall any previous version first"
echo "   - Ensure APK is not corrupted during transfer"