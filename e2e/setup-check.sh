#!/bin/bash

echo "🔧 Appium E2E Setup Verification"
echo "================================="

# Check if we're in the e2e directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the e2e directory"
    exit 1
fi

echo "📋 Checking dependencies..."

# Check Node.js version
NODE_VERSION=$(node --version)
echo "✅ Node.js: $NODE_VERSION"

# Check if Appium is installed
if command -v appium &> /dev/null; then
    APPIUM_VERSION=$(appium --version)
    echo "✅ Appium: $APPIUM_VERSION"
else
    echo "❌ Appium not found globally. Using local version."
fi

# Check installed drivers
echo ""
echo "📱 Checking Appium drivers..."
npx appium driver list 2>/dev/null | grep -E "(xcuitest|uiautomator2)" || echo "❌ Drivers not installed. Run: npm run driver:ios && npm run driver:android"

echo ""
echo "🔍 Running Appium Doctor checks..."

echo ""
echo "iOS Setup:"
echo "----------"
npm run doctor:ios 2>/dev/null | grep -E "(✔|✖)" | head -10

echo ""
echo "Android Setup:"
echo "--------------"
npm run doctor:android 2>/dev/null | grep -E "(✔|✖)" | head -10

echo ""
echo "📝 Next Steps:"
echo "=============="
echo "1. Fix any ❌ issues shown above"
echo "2. Update .env file with your device settings"
echo "3. Start your React Native app: npm start (in root directory)"
echo "4. Start Appium server: npm start (in e2e directory)"
echo "5. Run tests: npm test"

echo ""
echo "📚 For detailed setup instructions, see README.md"
