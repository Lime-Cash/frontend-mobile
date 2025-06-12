import { AuthActions } from "./AuthActions";
import { ExpoManager } from "./ExpoManager";
import { DebugHelpers } from "./DebugHelpers";

export class AppiumHelper extends AuthActions {
  private expoManager = new ExpoManager();
  protected debugUtils = new DebugHelpers(); // Changed from debugHelpers to avoid conflict

  // Expo server management (delegated)
  async startExpoServer(): Promise<void> {
    return this.expoManager.startExpoServer();
  }

  async stopExpoServer(): Promise<void> {
    return this.expoManager.stopExpoServer();
  }

  async openAppInSimulator(): Promise<void> {
    return this.expoManager.openAppInSimulator();
  }

  async setupExpoApp(): Promise<void> {
    return this.expoManager.setupExpoApp();
  }

  async getAccessibleElements(): Promise<string[]> {
    return this.debugUtils.getAccessibleElements();
  }

  async waitForLoadingToDisappear(timeout: number = 30000): Promise<void> {
    return this.debugUtils.waitForLoadingToDisappear(timeout);
  }

  async elementExists(selector: string): Promise<boolean> {
    return this.debugUtils.elementExists(selector);
  }

  async findElementByName(
    name: string,
    timeout: number = 30000,
  ): Promise<WebdriverIO.Element> {
    return this.debugUtils.findElementByName(name, timeout);
  }

  // Enhanced cleanup
  async cleanup(): Promise<void> {
    await this.quitDriver();
    await this.expoManager.cleanup();
  }

  // Keep some common aliases for backward compatibility
  async clearAndSetText(
    selector: string,
    text: string,
    timeout: number = 30000,
  ): Promise<void> {
    return this.fillTextAndDismissKeyboard(selector, text, timeout);
  }

  async findInputByLabel(
    labelText: string,
    timeout: number = 30000,
  ): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    try {
      const labelElement = await this.driver.$(
        `//XCUIElementTypeStaticText[@name="${labelText}"]`,
      );
      await labelElement.waitForDisplayed({ timeout });

      const parentContainer = await labelElement.$("..");
      const inputField = await parentContainer.$(
        "//XCUIElementTypeTextField | //XCUIElementTypeSecureTextField",
      );
      await inputField.waitForDisplayed({ timeout: 5000 });

      return inputField;
    } catch (error) {
      throw new Error(
        `Could not find input field for label "${labelText}": ${error}`,
      );
    }
  }

  // Driver availability check
  isDriverAvailable(): boolean {
    return this.driver !== null;
  }
}
