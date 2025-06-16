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

**Individual Test Suites:**
```bash
# Run login tests only
npm run test:login

# Run send money tests only
npm run test:send-money

npm run test:load

npm run test:withdraw


# Run all tests
npm test
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

## Test Suites

### Login Tests (`login.spec.ts`)
- ✅ Display all login screen elements correctly
- ✅ Login successfully with valid credentials and logout
- ✅ Reject invalid email format
- ✅ Reject short password
- ✅ Reject empty email field
- ✅ Reject empty password field
- ✅ Handle multiple login/logout cycles
- ✅ Navigate to register screen when sign up link is tapped

### Send Money Tests (`send-money.spec.ts`)
- ✅ Display all send money screen elements correctly
- ✅ Disable send button when amount is not entered
- ✅ Disable send button when recipient is not entered
- ✅ Enable send button when both amount and recipient are entered
- ✅ Successfully send money with valid inputs
- ✅ Handle invalid recipient email format
- ✅ Handle empty amount field
- ✅ Navigate back to home screen when back button is pressed
- ✅ Clear error states when input is corrected

## Test Structure

Each test suite follows the same pattern:
1. **Setup**: Login (if required) and navigate to the screen being tested
2. **Test Cases**: Validate functionality and edge cases
3. **Cleanup**: Logout and quit driver

## Available Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all test suites |
| `npm run test:login` | Run only login tests |
| `npm run test:send-money` | Run only send money tests |
| `npm run start` | Start Appium server |
| `npm run setup` | Install drivers and check setup |
| `npm run doctor` | Check iOS setup |

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