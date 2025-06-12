# iOS Appium E2E Testing

Quick setup for iOS-only end-to-end testing with Appium and Expo.

## Step-by-Step Setup

### 1. Prerequisites
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Verify you have Node.js 16+
node --version
```

### 2. Install Dependencies
```bash
# From project root
cd appium/e2e
npm install

# Install iOS driver
npm run setup
```

### 3. Start iOS Simulator
- Open **Xcode** → **Developer Tools** → **Simulator**
- Choose **iPhone 16 Pro** (iOS 18.4)
- Make sure simulator is running

### 4. Run Tests

**Quick start (recommended):**
```bash
# From project root - starts Expo + runs tests
npm run appium:dev
```

**Manual control:**
```bash
# Terminal 1: Start Expo
npm start
# Press 'i' to open in iOS Simulator

# Terminal 2: Start Appium server
cd appium/e2e && npm run start

# Terminal 3: Run tests
cd appium/e2e && npm test
```

## Available Scripts

```bash
npm run test          # Run all tests
npm run test:login    # Run login tests only
npm run doctor        # Check iOS setup
npm run setup         # Install driver + run doctor
```

## Troubleshooting

**App not found?**
- Make sure Expo app is running in iOS Simulator
- Check simulator device name matches config

**Connection refused?**
- Restart Appium server: `npm run start`
- Reset iOS Simulator: Device → Erase All Content

**Tests failing?**
- Run `npm run doctor` to verify setup

## Project Structure

```
appium/e2e/
├── __tests__/           # Test files
├── helpers/            # Page objects & utilities
├── config/             # iOS configuration
└── screenshots/        # Debug screenshots
```