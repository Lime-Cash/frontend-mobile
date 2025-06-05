#!/bin/bash

# Appium E2E Test Runner for React Native Expo App
# This script helps you run Appium tests with proper setup

echo "🚀 Appium E2E Test Runner"
echo "========================="

# Check if iOS Simulator is running
if ! pgrep -x "Simulator" > /dev/null; then
    echo "❌ iOS Simulator is not running"
    echo "Please start iOS Simulator first:"
    echo "   Open Xcode → Open Developer Tool → Simulator"
    echo "   Or run: open -a Simulator"
    exit 1
fi

echo "✅ iOS Simulator is running"

# Check if Appium server is running
if ! lsof -i :4723 > /dev/null 2>&1; then
    echo "❌ Appium server is not running on port 4723"
    echo "Starting Appium server..."
    cd appium/e2e
    npm run start &
    APPIUM_PID=$!
    echo "Appium server started with PID: $APPIUM_PID"
    cd ../..
    
    # Wait for Appium server to start
    echo "Waiting for Appium server to be ready..."
    sleep 5
else
    echo "✅ Appium server is already running on port 4723"
fi

# Check if Expo app is running
echo "📱 Please ensure your Expo app is running:"
echo "   1. Run 'npm start' in another terminal"
echo "   2. Press 'i' to open in iOS Simulator"
echo "   3. Wait for the app to fully load"
echo ""
read -p "Press Enter when your app is loaded and ready in the simulator..."

echo ""
echo "🧪 Running Appium tests..."

# Run the register test
cd appium/e2e
npm run test:register

echo ""
echo "📸 Test screenshots are saved in: appium/e2e/screenshots/"
echo "✅ Test run completed!"

# Clean up if we started Appium server
if [ ! -z "$APPIUM_PID" ]; then
    echo "Stopping Appium server..."
    kill $APPIUM_PID 2>/dev/null || true
fi
