import { AppiumHelper } from "./AppiumHelper";

export class TestSetup {
  private static helper: AppiumHelper;
  private static isSetupComplete = false;

  static async beforeAll(timeout: number = 60000): Promise<AppiumHelper> {
    if (!TestSetup.isSetupComplete) {
      console.log("Setting up test environment...");
      TestSetup.helper = new AppiumHelper();

      try {
        console.log("Initializing Appium driver...");
        await TestSetup.helper.initDriver();

        console.log("Driver initialized successfully!");
        TestSetup.isSetupComplete = true;
      } catch (error) {
        console.error("Test setup failed:", error);
        await TestSetup.cleanup();
        throw error;
      }
    }

    return TestSetup.helper;
  }

  static async afterAll(): Promise<void> {
    if (TestSetup.helper) {
      await TestSetup.cleanup();
    }
  }

  private static async cleanup(): Promise<void> {
    if (TestSetup.helper) {
      await TestSetup.helper.quitDriver();
      TestSetup.isSetupComplete = false;
    }
  }

  // Helper method to wait for app to be ready
  static async waitForAppReady(
    helper: AppiumHelper,
    timeout: number = 30000,
  ): Promise<void> {
    if (!helper.driver) {
      throw new Error("Driver not initialized");
    }

    console.log("Waiting for app to be ready...");

    try {
      // Wait for any loading screens to disappear
      await helper.waitForLoadingToDisappear(timeout);

      // Try to find common app elements to confirm it's loaded
      const commonSelectors = [
        "//XCUIElementTypeButton",
        "//XCUIElementTypeStaticText",
        "//XCUIElementTypeNavigationBar",
        "//XCUIElementTypeTabBar",
        "//XCUIElementTypeTextField",
      ];

      let appReady = false;
      for (const selector of commonSelectors) {
        try {
          await helper.waitForElement(selector, 5000);
          appReady = true;
          console.log(`App ready - found element with selector: ${selector}`);
          break;
        } catch (error) {
          // Continue to next selector
        }
      }

      if (!appReady) {
        console.warn(
          "Could not detect app ready state, but continuing with test",
        );
      }
    } catch (error) {
      console.log("App ready check completed with warnings:", error);
    }
  }
}
