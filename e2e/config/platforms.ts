import { RemoteOptions } from "webdriverio";

export const iosConfig: RemoteOptions = {
  path: "/",
  hostname: "localhost",
  port: 4723,
  capabilities: {
    "appium:platformName": "iOS",
    "appium:automationName": "XCUITest",
    "appium:deviceName": "iPhone 16 Pro", // Updated to match your simulator
    "appium:platformVersion": "18.4", // Updated to match your iOS simulator version
    "appium:bundleId": "host.exp.Exponent", // Expo Go bundle ID for development (capital E)
    "appium:autoAcceptAlerts": true,
    "appium:permissions": '{"host.exp.exponent": {"location": "yes"}}',
    "appium:newCommandTimeout": 240,
    "appium:connectHardwareKeyboard": false,
    // For development builds, you might need to use:
    // "appium:app": "/path/to/your/app.app", // For standalone builds
  },
  logLevel: "silent",
};

export const androidConfig: RemoteOptions = {
  path: "/",
  hostname: "localhost",
  port: 4723,
  capabilities: {
    "appium:automationName": "UiAutomator2",
    "appium:platformName": "Android",
    "appium:platformVersion": "14.0", // Update to match your Android emulator version
    "appium:deviceName": "Pixel_7_API_34", // Update to match your Android emulator name
    "appium:appPackage": "host.exp.exponent", // Expo Go package for development
    "appium:appActivity": ".experience.HomeActivity",
    "appium:autoGrantPermissions": true,
    "appium:newCommandTimeout": 240,
    // For development builds, you might need to use:
    // "appium:app": "/path/to/your/app.apk", // For standalone builds
    // "appium:appPackage": "com.yourdomain.yourapp", // Your app's package name
  },
  logLevel: "silent",
};

// Get configuration based on environment variable
export const getConfig = (): RemoteOptions => {
  const platform = process.env.PLATFORM?.toLowerCase() || "ios";
  return platform === "android" ? androidConfig : iosConfig;
};
