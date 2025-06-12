import { RemoteOptions } from "webdriverio";

/**
 * iOS-only Appium configuration for Expo development
 * Optimized for iPhone simulators and Expo Go testing
 */
export const iosConfig: RemoteOptions = {
  path: "/",
  hostname: "localhost",
  port: 4723,
  capabilities: {
    "appium:platformName": "iOS",
    "appium:automationName": "XCUITest",
    "appium:deviceName": "iPhone 16 Pro", // Current simulator
    "appium:platformVersion": "18.4", // iOS version
    "appium:bundleId": "host.exp.Exponent", // Expo Go bundle ID
    "appium:autoAcceptAlerts": true, // Auto-accept permission alerts
    "appium:permissions": '{"host.exp.exponent": {"location": "yes"}}',
    "appium:newCommandTimeout": 300, // 5 minutes timeout
    "appium:connectHardwareKeyboard": false, // Use software keyboard
    "appium:noReset": true, // Keep app state between sessions for faster tests
    "appium:fullReset": false, // Don't uninstall app, just reset state
    "appium:autoLaunch": false, // Don't auto-launch - connect to existing app
    "appium:wdaLaunchTimeout": 60000, // WebDriverAgent launch timeout
    "appium:wdaConnectionTimeout": 60000, // WebDriverAgent connection timeout
    // Production build options (uncomment when needed):
    // "appium:app": "/path/to/your/app.app", // For .app builds
    // "appium:bundleId": "com.yourcompany.yourapp", // Your actual bundle ID
  },
  logLevel: "silent", // Change to "info" for debugging
};

// For iOS-only setup, we just export the iOS config
export const getConfig = (): RemoteOptions => {
  return iosConfig;
};
