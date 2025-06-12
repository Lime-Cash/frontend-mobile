import { remote } from "webdriverio";
import { getConfig } from "../config/platforms";

/**
 * Core WebDriver management and basic element operations
 */
export class BaseDriver {
  public driver: WebdriverIO.Browser | null = null;

  async initDriver(): Promise<WebdriverIO.Browser> {
    const config = getConfig();
    this.driver = await remote(config);

    // Give the app time to connect to existing session
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Connect to existing Expo Go session (don't launch new one)
    try {
      await this.driver.activateApp("host.exp.Exponent");
      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log("✓ Connected to existing Expo Go session");
    } catch (error) {
      console.log("Connection warning:", error);
      console.log("💡 Make sure your app is already running in Expo Go");
    }

    return this.driver;
  }

  async quitDriver(): Promise<void> {
    if (this.driver) {
      await this.driver.deleteSession();
      this.driver = null;
    }
  }

  // Basic element operations
  async waitForElement(
    selector: string,
    timeout: number = 800,
  ): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    const element = await this.driver.$(selector);
    await element.waitForDisplayed({ timeout });
    return element;
  }

  async isElementDisplayed(
    selector: string,
    timeout: number = 800,
  ): Promise<boolean> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    try {
      const element = await this.driver.$(selector);
      await element.waitForDisplayed({ timeout });
      return true;
    } catch (error) {
      return false;
    }
  }
}
