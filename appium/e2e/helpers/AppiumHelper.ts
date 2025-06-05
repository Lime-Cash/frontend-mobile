import { remote } from "webdriverio";
import { getConfig } from "../config/platforms";
import * as fs from "fs";
import * as path from "path";
import { spawn, ChildProcess } from "child_process";

export class AppiumHelper {
  public driver: WebdriverIO.Browser | null = null;
  private expoProcess: ChildProcess | null = null;

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

  // Helper method to wait for text input by placeholder
  async waitForTextInput(
    placeholder: string,
    timeout: number = 30000,
  ): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    const selector = `//XCUIElementTypeTextField[@placeholder="${placeholder}"] | //XCUIElementTypeSecureTextField[@placeholder="${placeholder}"]`;
    const element = await this.driver.$(selector);
    await element.waitForDisplayed({ timeout });
    return element;
  }

  // Helper method to wait for button by text
  async waitForButton(
    text: string,
    timeout: number = 30000,
  ): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    const selector = `//XCUIElementTypeButton[@name="${text}"]`;
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

  // Helper method to clear and set text more reliably
  async clearAndSetText(
    selector: string,
    text: string,
    timeout: number = 30000,
  ): Promise<void> {
    const element = await this.waitForElement(selector, timeout);

    // Clear existing text more thoroughly
    await element.click();
    await element.clearValue();
    await element.setValue(text);
  }

  // Helper method to wait for element by text content
  async waitForElementByText(
    text: string,
    timeout: number = 30000,
  ): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    const element = await this.driver.$(
      `//*[@text="${text}" or @label="${text}" or @name="${text}"]`,
    );
    await element.waitForDisplayed({ timeout });
    return element;
  }

  // Helper method to check if element exists without waiting
  async elementExists(selector: string): Promise<boolean> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    try {
      const element = await this.driver.$(selector);
      return await element.isExisting();
    } catch (error) {
      return false;
    }
  }

  // Helper method to scroll to element if not visible
  async scrollToElement(selector: string): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    const element = await this.driver.$(selector);
    await element.scrollIntoView();
    return element;
  }

  // Helper method to wait for loading to disappear
  async waitForLoadingToDisappear(timeout: number = 30000): Promise<void> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    try {
      const loadingElement = await this.driver.$("~loading");
      await loadingElement.waitForDisplayed({ timeout: 2000 });
      await loadingElement.waitForDisplayed({ timeout, reverse: true });
    } catch (error) {
      // Loading element might not exist or already disappeared
      console.log("Loading element not found or already gone");
    }
  }

  // Helper method to start Expo development server
  async startExpoServer(): Promise<void> {
    console.log("Starting Expo development server...");

    return new Promise((resolve, reject) => {
      // Navigate to the project root directory (two levels up from appium/e2e)
      const projectRoot = path.resolve(__dirname, "../../../");
      console.log(`Starting Expo in: ${projectRoot}`);

      this.expoProcess = spawn("npx", ["expo", "start", "--clear"], {
        cwd: projectRoot,
        stdio: "pipe",
        detached: false,
      });

      let startupComplete = false;

      this.expoProcess.stdout?.on("data", (data) => {
        const output = data.toString();
        console.log("Expo:", output);

        // Look for indicators that Expo is ready
        if (
          output.includes("Metro waiting on") ||
          output.includes("Expo DevTools") ||
          (output.includes("›") && output.includes("Press"))
        ) {
          if (!startupComplete) {
            startupComplete = true;
            console.log("Expo server is ready!");

            // Wait a bit more to ensure everything is fully loaded
            setTimeout(() => {
              resolve();
            }, 3000);
          }
        }
      });

      this.expoProcess.stderr?.on("data", (data) => {
        console.error("Expo error:", data.toString());
      });

      this.expoProcess.on("error", (error) => {
        console.error("Failed to start Expo:", error);
        reject(error);
      });

      this.expoProcess.on("exit", (code) => {
        console.log(`Expo process exited with code ${code}`);
        if (!startupComplete) {
          reject(
            new Error(`Expo process exited prematurely with code ${code}`),
          );
        }
      });

      // Timeout after 60 seconds
      setTimeout(() => {
        if (!startupComplete) {
          reject(new Error("Expo server startup timeout"));
        }
      }, 60000);
    });
  }

  // Helper method to stop Expo development server
  async stopExpoServer(): Promise<void> {
    if (this.expoProcess) {
      console.log("Stopping Expo development server...");
      this.expoProcess.kill("SIGTERM");

      // Wait for process to exit
      await new Promise((resolve) => {
        if (this.expoProcess) {
          this.expoProcess.on("exit", resolve);
          // Fallback timeout
          setTimeout(resolve, 5000);
        } else {
          resolve(void 0);
        }
      });

      this.expoProcess = null;
    }
  }

  // Helper method to open app in iOS simulator via Expo
  async openAppInSimulator(): Promise<void> {
    console.log("Opening app in iOS simulator...");

    return new Promise((resolve, reject) => {
      const projectRoot = path.resolve(__dirname, "../../../");

      const openProcess = spawn("npx", ["expo", "start", "--ios"], {
        cwd: projectRoot,
        stdio: "pipe",
      });

      let opened = false;

      openProcess.stdout?.on("data", (data) => {
        const output = data.toString();
        console.log("Expo iOS:", output);

        if (
          output.includes("Opening on iOS") ||
          output.includes("Opened on iOS") ||
          output.includes("simulator")
        ) {
          if (!opened) {
            opened = true;
            // Wait for app to fully load in simulator
            setTimeout(() => {
              openProcess.kill();
              resolve();
            }, 8000);
          }
        }
      });

      openProcess.stderr?.on("data", (data) => {
        console.error("Expo iOS error:", data.toString());
      });

      openProcess.on("error", (error) => {
        console.error("Failed to open iOS app:", error);
        reject(error);
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!opened) {
          openProcess.kill();
          reject(new Error("Failed to open app in simulator within timeout"));
        }
      }, 30000);
    });
  }

  // Complete setup method that starts Expo and opens the app
  async setupExpoApp(): Promise<void> {
    try {
      await this.startExpoServer();
      await this.openAppInSimulator();
      console.log("Expo app setup completed successfully!");
    } catch (error) {
      console.error("Failed to setup Expo app:", error);
      await this.stopExpoServer();
      throw error;
    }
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    await this.quitDriver();
    await this.stopExpoServer();
  }

  // Helper method to find input field by its label text
  async findInputByLabel(
    labelText: string,
    timeout: number = 30000,
  ): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    try {
      // First find the label
      const labelElement = await this.driver.$(
        `//XCUIElementTypeStaticText[@name="${labelText}"]`,
      );
      await labelElement.waitForDisplayed({ timeout });

      // Then find the input that follows it in the UI hierarchy
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

  // Helper method to get all accessible elements for debugging
  async getAccessibleElements(): Promise<string[]> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    try {
      const elements = await this.driver.$$('//*[@accessible="true"]');
      const elementInfo: string[] = [];

      for (let i = 0; i < Math.min(20, elements.length); i++) {
        try {
          const tagName = await elements[i].getTagName();
          let text = "";
          try {
            text = await elements[i].getText();
          } catch (e) {
            // Some elements don't have text
          }
          elementInfo.push(`${tagName}: "${text}"`);
        } catch (error) {
          elementInfo.push(`Element ${i}: Error getting info`);
        }
      }

      return elementInfo;
    } catch (error) {
      throw new Error(`Could not get accessible elements: ${error}`);
    }
  }
}
