# Appium E2E Testing Setup

This directory contains the Appium 2.0 setup for end-to-end testing of your React Native Expo app with TypeScript.

## Quick Start Guide

### 1. Prerequisites
- macOS with Xcode and iOS Simulator
- Node.js (v16 or higher)
- Your React Native Expo app should be ready to run

### 2. Setup (First Time Only)
```bash
# From the project root
npm run appium:setup  # Install Appium drivers
```

### 3. Running Tests

**Option A: Use the helper script (Recommended)**
```bash
# From the project root
./appium/run-tests.sh
```

**Option B: Manual setup**
```bash
# Terminal 1: Start your Expo app
npm start
# Press 'i' to open in iOS Simulator

# Terminal 2: Start Appium server  
cd appium/e2e
npm run start

# Terminal 3: Run tests
cd appium/e2e
npm run test:register
```

### 4. What the Tests Do

The registration test (`register.spec.ts`) will:
1. Connect to your running Expo app in the iOS Simulator
2. Take screenshots at each step
3. Look for registration/sign-up navigation
4. Attempt to fill out registration forms if found
5. Save all screenshots to `screenshots/` directory

### 5. Troubleshooting

**App not loading properly?**
- Make sure Expo development server is running (`npm start`)
- Ensure the app is fully loaded in iOS Simulator before running tests
- Check that no other apps are conflicting with port 4723

**Tests can't find elements?**
- Check the screenshots in `screenshots/` to see what the app looks like during tests
- Elements might have different selectors than expected
- The app might need different navigation to reach registration

**Connection issues?**
- Restart iOS Simulator
- Kill and restart Appium server
- Check that your device name matches in `.env` file

## Prerequisites

### For iOS Testing
- macOS with Xcode installed
- iOS Simulator
- Node.js (v16 or higher)

### For Android Testing  
- Android Studio with SDK
- Android Emulator or physical device
- Java Development Kit (JDK 11 or higher)

## Environment Setup

### Android Environment Variables
Add these to your shell profile (`~/.zshrc`, `~/.bash_profile`, etc.):

```bash
# Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Java (adjust path to your JDK installation)
export JAVA_HOME=$(/usr/libexec/java_home)
```

After adding these, restart your terminal or run `source ~/.zshrc`.

### Install Optional Dependencies

For better iOS testing experience:
```bash
# Install optional iOS tools
brew install carthage
brew install ios-deploy
npm install -g applesimutils
```

For Android testing:
```bash
# Download Android SDK and set up emulators via Android Studio
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Appium drivers:**
   ```bash
   npm run driver:ios      # Install XCUITest driver for iOS
   npm run driver:android  # Install UiAutomator2 driver for Android
   ```

3. **Verify setup:**
   ```bash
   npm run doctor:ios      # Check iOS setup
   npm run doctor:android  # Check Android setup
   ```

## Configuration

### Update Device Settings

Edit the `.env` file to match your testing devices:

**For iOS:**
- `IOS_DEVICE_NAME`: Name of your iOS simulator (e.g., "iPhone 15 Pro")
- `IOS_PLATFORM_VERSION`: iOS version (e.g., "17.0")
- `IOS_UDID`: Device UDID (for physical devices)

**For Android:**
- `ANDROID_DEVICE_NAME`: Android emulator name (e.g., "Pixel_7_API_34")
- `ANDROID_PLATFORM_VERSION`: Android version (e.g., "14.0")

### App Configuration

**For Development (Expo Go):**
- iOS: `bundleId: "host.exp.exponent"`
- Android: `appPackage: "host.exp.exponent"`

**For Production Builds:**
- Update `bundleId`/`appPackage` to your app's identifier
- Set `app` capability to point to your `.app`/`.apk` file

## Running Tests

### Start your React Native app:
```bash
# In the root directory
npm start
```

### Start Appium server:
```bash
# In the e2e directory
npm start
```

### Run tests:
```bash
# Run iOS tests
npm run test:ios

# Run Android tests  
npm run test:android

# Run all tests (default platform from .env)
npm test
```

## Writing Tests

Tests are located in the `__tests__` directory. Example test structure:

```typescript
import { AppiumHelper } from "../helpers/AppiumHelper";

describe("My Feature", () => {
  let appiumHelper: AppiumHelper;

  beforeEach(async () => {
    appiumHelper = new AppiumHelper();
    await appiumHelper.initDriver();
  });

  afterEach(async () => {
    await appiumHelper.quitDriver();
  });

  it("should perform some action", async () => {
    await appiumHelper.clickElement("~my-button");
    expect(await appiumHelper.isElementDisplayed("~success-message")).toBe(true);
  });
});
```

## Helper Methods

The `AppiumHelper` class provides convenient methods:

- `waitForElement(selector)` - Wait for element to appear
- `clickElement(selector)` - Click an element
- `setText(selector, text)` - Set text in input field
- `getText(selector)` - Get text from element
- `isElementDisplayed(selector)` - Check if element is visible
- `takeScreenshot(filename)` - Capture screenshot
- `swipe(startX, startY, endX, endY)` - Perform swipe gesture

## Element Selectors

Use accessibility identifiers for reliable element selection:

```typescript
// In your React Native components
<Button accessible={true} accessibilityLabel="login-button" />

// In your tests
await appiumHelper.clickElement("~login-button");
```

## Troubleshooting

### Common Issues

1. **Connection refused errors**: Make sure Appium server is running (`npm start`)

2. **App not found**: Verify your app is installed on the simulator/emulator

3. **Element not found**: Check accessibility labels and wait for elements to load

4. **iOS Simulator issues**: Reset simulator: Device → Erase All Content and Settings

5. **Android Emulator issues**: 
   - Make sure emulator is running and unlocked
   - Check ANDROID_HOME environment variables

### Debug Mode

Set `logLevel: "info"` in platform configurations for detailed logs.

### Screenshots

Failed tests automatically capture screenshots in the `screenshots/` directory.

## CI/CD Integration

For continuous integration, you can run tests headlessly:

```bash
# Set up environment variables in CI
export PLATFORM=ios
npm test
```

Make sure to have simulators/emulators set up in your CI environment.
