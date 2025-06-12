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

    // Give the app time to fully load after connection
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Ensure the app is in foreground
    try {
      await this.driver.activateApp("host.exp.Exponent");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.log("App activation warning:", error);
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
    timeout: number = 30000,
  ): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    const element = await this.driver.$(selector);
    await element.waitForDisplayed({ timeout });
    return element;
  }

  async clickElement(selector: string, timeout: number = 30000): Promise<void> {
    const element = await this.waitForElement(selector, timeout);
    await element.click();
  }

  async setText(
    selector: string,
    text: string,
    timeout: number = 30000,
  ): Promise<void> {
    const element = await this.waitForElement(selector, timeout);
    await element.clearValue();
    await element.setValue(text);
  }

  async getText(selector: string, timeout: number = 30000): Promise<string> {
    const element = await this.waitForElement(selector, timeout);
    return await element.getText();
  }

  async isElementDisplayed(
    selector: string,
    timeout: number = 5000,
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
