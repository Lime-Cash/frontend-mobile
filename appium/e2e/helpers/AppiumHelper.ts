import { remote } from "webdriverio";
import { getConfig } from "../config/platforms";
import * as fs from "fs";
import * as path from "path";

export class AppiumHelper {
  public driver: WebdriverIO.Browser | null = null;

  async initDriver(): Promise<WebdriverIO.Browser> {
    const config = getConfig();
    this.driver = await remote(config);
    return this.driver;
  }

  async quitDriver(): Promise<void> {
    if (this.driver) {
      await this.driver.deleteSession();
      this.driver = null;
    }
  }

  // Helper method to wait for element to be displayed
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

  // Helper method to wait for element and click
  async clickElement(selector: string, timeout: number = 30000): Promise<void> {
    const element = await this.waitForElement(selector, timeout);
    await element.click();
  }

  // Helper method to set text in an input field
  async setText(
    selector: string,
    text: string,
    timeout: number = 30000,
  ): Promise<void> {
    const element = await this.waitForElement(selector, timeout);
    await element.clearValue();
    await element.setValue(text);
  }

  // Helper method to get text from an element
  async getText(selector: string, timeout: number = 30000): Promise<string> {
    const element = await this.waitForElement(selector, timeout);
    return await element.getText();
  }

  // Helper method to check if element is displayed
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

  // Helper method to swipe (useful for scrolling)
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

  // Helper method to take screenshot
  async takeScreenshot(filename?: string): Promise<string> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    const screenshot = await this.driver.takeScreenshot();

    if (filename) {
      const screenshotPath = path.join(process.cwd(), "screenshots", filename);

      // Ensure screenshots directory exists
      const screenshotDir = path.dirname(screenshotPath);
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }

      fs.writeFileSync(screenshotPath, screenshot, "base64");
      console.log(`Screenshot saved: ${screenshotPath}`);
      return screenshotPath;
    }

    return screenshot;
  }
}
