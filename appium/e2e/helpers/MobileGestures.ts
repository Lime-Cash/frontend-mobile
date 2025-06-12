import { BaseDriver } from "./BaseDriver";

/**
 * iOS-specific mobile gestures and interactions
 * Optimized for iPhone simulators and XCUITest
 */
export class MobileGestures extends BaseDriver {
  // iOS swipe gestures
  async swipe(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    duration: number = 1000,
  ): Promise<void> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    await this.driver.touchAction([
      { action: "press", x: startX, y: startY },
      { action: "wait", ms: duration },
      { action: "moveTo", x: endX, y: endY },
      { action: "release" },
    ]);
  }

  // iOS keyboard management (optimized for XCUITest)
  async dismissKeyboard(): Promise<void> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    try {
      // Method 1: Try "Done" button (most common on iOS)
      const doneButton = await this.driver.$(
        '//XCUIElementTypeButton[@name="Done"]',
      );
      if (await doneButton.isDisplayed()) {
        await doneButton.click();
        console.log("✓ Keyboard dismissed using Done button");
        return;
      }
    } catch (error) {
      // Continue to next method
    }

    try {
      // Method 2: Try "Return" key
      const returnKey = await this.driver.$(
        '//XCUIElementTypeButton[@name="Return"]',
      );
      if (await returnKey.isDisplayed()) {
        await returnKey.click();
        console.log("✓ Keyboard dismissed using Return key");
        return;
      }
    } catch (error) {
      // Continue to next method
    }

    try {
      // Method 3: Use WebDriverIO hideKeyboard() method
      await this.driver.hideKeyboard();
      console.log("✓ Keyboard dismissed using hideKeyboard()");
    } catch (error) {
      console.log("Could not dismiss keyboard:", error);
    }
  }

  async isKeyboardVisible(): Promise<boolean> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    try {
      // Look for iOS keyboard element
      const keyboard = await this.driver.$("//XCUIElementTypeKeyboard");
      return await keyboard.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  async tapOutsideKeyboard(): Promise<void> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    try {
      const windowSize = await this.driver.getWindowSize();

      // Tap in the top area of the screen (away from keyboard)
      await this.driver.touchAction({
        action: "tap",
        x: windowSize.width / 2,
        y: 100, // Top of screen
      });

      console.log("✓ Tapped outside to dismiss keyboard");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.log("Could not tap outside to dismiss keyboard:", error);
    }
  }

  async scrollToElement(selector: string): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    const element = await this.driver.$(selector);
    await element.scrollIntoView();
    return element;
  }

  // iOS-specific scroll methods
  async scrollDown(distance: number = 300): Promise<void> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    const windowSize = await this.driver.getWindowSize();
    const centerX = windowSize.width / 2;
    const startY = windowSize.height * 0.8;
    const endY = startY - distance;

    await this.swipe(centerX, startY, centerX, endY, 800);
  }

  async scrollUp(distance: number = 300): Promise<void> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    const windowSize = await this.driver.getWindowSize();
    const centerX = windowSize.width / 2;
    const startY = windowSize.height * 0.2;
    const endY = startY + distance;

    await this.swipe(centerX, startY, centerX, endY, 800);
  }
}
