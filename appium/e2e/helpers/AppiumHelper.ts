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

  // Helper method to wait for text input by placeholder or name
  async waitForTextInput(
    identifier: string,
    timeout: number = 30000,
  ): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    // For iOS, let's try the direct approach based on what we see in the debug output
    try {
      // Try finding the element directly by name (as shown in debug: 'XCUIElementTypeTextField: "Email"')
      const textFieldSelector = `//XCUIElementTypeTextField[@name="${identifier}"]`;
      const textField = await this.driver.$(textFieldSelector);
      await textField.waitForDisplayed({ timeout: 5000 });
      return textField;
    } catch (error) {
      // Try secure text field for password
      try {
        const secureFieldSelector = `//XCUIElementTypeSecureTextField[@name="${identifier}"]`;
        const secureField = await this.driver.$(secureFieldSelector);
        await secureField.waitForDisplayed({ timeout: 5000 });
        return secureField;
      } catch (secureError) {
        // Try other selectors as fallback
        const selectors = [
          `//XCUIElementTypeTextField[@placeholder="${identifier}"]`,
          `//XCUIElementTypeSecureTextField[@placeholder="${identifier}"]`,
          `//XCUIElementTypeTextField[@label="${identifier}"]`,
          `//XCUIElementTypeSecureTextField[@label="${identifier}"]`,
          `//XCUIElementTypeTextField[contains(@name,"${identifier}")]`,
          `//XCUIElementTypeSecureTextField[contains(@name,"${identifier}")]`,
        ];

        for (const selector of selectors) {
          try {
            const element = await this.driver.$(selector);
            await element.waitForDisplayed({ timeout: 2000 });
            return element;
          } catch (fallbackError) {
            continue;
          }
        }
      }
    }

    throw new Error(
      `Could not find text input with identifier "${identifier}"`,
    );
  }

  // Helper method to wait for button by text
  async waitForButton(
    text: string,
    timeout: number = 30000,
  ): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    // Try multiple selectors for button
    const selectors = [
      `//XCUIElementTypeButton[@name="${text}"]`,
      `//XCUIElementTypeOther[@name="${text}"]`,
      `//XCUIElementTypeStaticText[@name="${text}"]`,
      `//*[@name="${text}"]`,
      `//*[contains(@name,"${text}")]`,
    ];

    for (const selector of selectors) {
      try {
        const element = await this.driver.$(selector);
        await element.waitForDisplayed({ timeout: 5000 });
        console.log(`Found button using selector: ${selector}`);
        return element;
      } catch (error) {
        console.log(`Button selector ${selector} failed, trying next...`);
      }
    }

    throw new Error(
      `Could not find button with text "${text}" using any selector`,
    );
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

  // Helper method to find element by exact name attribute
  async findElementByName(
    name: string,
    timeout: number = 30000,
  ): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    const element = await this.driver.$(`//*[@name="${name}"]`);
    await element.waitForDisplayed({ timeout });
    return element;
  }

  // Helper method to find email input field specifically
  async findEmailField(timeout: number = 30000): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    // Since we know the Email field is the first text field, let's find it directly
    try {
      // First, try to find the Email text field by looking for all text fields
      const textFields = await this.driver.$$("//XCUIElementTypeTextField");

      for (let i = 0; i < textFields.length; i++) {
        try {
          const text = await textFields[i].getText();
          console.log(`Text field ${i}: "${text}"`);
          if (text === "Email" || text === "" || text === "email") {
            // Check if this is displayed and clickable
            const isDisplayed = await textFields[i].isDisplayed();
            if (isDisplayed) {
              return textFields[i];
            }
          }
        } catch (e: any) {
          console.log(`Could not get text from text field ${i}:`, e.message);
        }
      }

      // If that doesn't work, just return the first text field
      if (textFields.length > 0) {
        const firstField = textFields[0];
        const isDisplayed = await firstField.isDisplayed();
        if (isDisplayed) {
          console.log("Using first available text field as email field");
          return firstField;
        }
      }

      throw new Error("No suitable email text field found");
    } catch (error: any) {
      throw new Error(`Could not find email input field: ${error.message}`);
    }
  }

  // Helper method to find password input field specifically
  async findPasswordField(
    timeout: number = 30000,
  ): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    try {
      // Find all secure text fields
      const secureFields = await this.driver.$$(
        "//XCUIElementTypeSecureTextField",
      );

      for (let i = 0; i < secureFields.length; i++) {
        try {
          const text = await secureFields[i].getText();
          console.log(`Secure field ${i}: "${text}"`);
          if (text === "Password" || text === "" || text === "password") {
            // Check if this is displayed and clickable
            const isDisplayed = await secureFields[i].isDisplayed();
            if (isDisplayed) {
              return secureFields[i];
            }
          }
        } catch (e: any) {
          console.log(`Could not get text from secure field ${i}:`, e.message);
        }
      }

      // If that doesn't work, just return the first secure text field
      if (secureFields.length > 0) {
        const firstField = secureFields[0];
        const isDisplayed = await firstField.isDisplayed();
        if (isDisplayed) {
          console.log(
            "Using first available secure text field as password field",
          );
          return firstField;
        }
      }

      throw new Error("No suitable password secure text field found");
    } catch (error: any) {
      throw new Error(`Could not find password input field: ${error.message}`);
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

  // Helper method to dismiss keyboard by pressing return/done
  async dismissKeyboard(): Promise<void> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    try {
      // Try to find and tap the "Done" or "Return" button on iOS keyboard
      const doneButton = await this.driver.$(
        '//XCUIElementTypeButton[@name="Done"]',
      );
      if (await doneButton.isDisplayed()) {
        await doneButton.click();
        console.log("✓ Keyboard dismissed using Done button");
        return;
      }
    } catch (error) {
      // Done button not found, try Return key
    }

    try {
      // Try to find and tap the "Return" key
      const returnKey = await this.driver.$(
        '//XCUIElementTypeButton[@name="Return"]',
      );
      if (await returnKey.isDisplayed()) {
        await returnKey.click();
        console.log("✓ Keyboard dismissed using Return key");
        return;
      }
    } catch (error) {
      // Return key not found
    }

    try {
      // Try hiding keyboard using driver method
      await this.driver.hideKeyboard();
      console.log("✓ Keyboard dismissed using hideKeyboard()");
    } catch (error) {
      console.log("Could not dismiss keyboard:", error);
    }
  }

  // Helper method to tap outside input fields to dismiss keyboard
  async tapOutsideKeyboard(): Promise<void> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    try {
      // Get screen dimensions
      const windowSize = await this.driver.getWindowSize();

      // Tap on an empty area (top part of screen, away from keyboard)
      await this.driver.touchAction({
        action: "tap",
        x: windowSize.width / 2,
        y: 100,
      });

      console.log("✓ Tapped outside to dismiss keyboard");
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for keyboard to hide
    } catch (error) {
      console.log("Could not tap outside to dismiss keyboard:", error);
    }
  }

  // Helper method to check if keyboard is visible
  async isKeyboardVisible(): Promise<boolean> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    try {
      // Look for common keyboard elements
      const keyboard = await this.driver.$("//XCUIElementTypeKeyboard");
      return await keyboard.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  // Enhanced method to fill text field and dismiss keyboard
  async fillTextAndDismissKeyboard(
    selector: string,
    text: string,
    timeout: number = 30000,
  ): Promise<void> {
    const element = await this.waitForElement(selector, timeout);
    await element.click();
    await element.clearValue();
    await element.setValue(text);

    // Wait a moment for keyboard to fully appear
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Try to dismiss keyboard
    await this.dismissKeyboard();
  }

  // Enhanced method to find email field and fill with keyboard dismissal
  async fillEmailField(email: string): Promise<void> {
    console.log("Finding and filling email field...");
    const emailField = await this.findEmailField();
    await emailField.click();
    await emailField.clearValue();
    await emailField.setValue(email);

    // Wait for keyboard and then dismiss it
    await new Promise((resolve) => setTimeout(resolve, 500));
    await this.dismissKeyboard();
    console.log("✓ Email field filled and keyboard dismissed");
  }

  // Enhanced method to find password field and fill with keyboard dismissal
  async fillPasswordField(password: string): Promise<void> {
    console.log("Finding and filling password field...");
    const passwordField = await this.findPasswordField();
    await passwordField.click();
    await passwordField.clearValue();
    await passwordField.setValue(password);

    // Wait for keyboard and then dismiss it
    await new Promise((resolve) => setTimeout(resolve, 500));
    await this.dismissKeyboard();
    console.log("✓ Password field filled and keyboard dismissed");
  }

  // Helper method to logout if user is logged in
  async logoutIfLoggedIn(): Promise<void> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    try {
      // Check if we're on the home screen (logged in)
      const limeCashElement = await this.driver.$(
        '//*[@name="Lime Cash" or @text="Lime Cash"]',
      );
      const isLoggedIn = await limeCashElement.isDisplayed();

      if (isLoggedIn) {
        console.log("User is logged in, performing logout...");

        // Find and click logout button - it's an XCUIElementTypeOther with specific text pattern
        const logoutSelectors = [
          '//XCUIElementTypeOther[contains(@name,"Logout")]',
          '//XCUIElementTypeOther[contains(@name,"rectangle.portrait.and.arrow.forward Logout")]',
          '//*[contains(@name,"rectangle.portrait.and.arrow.forward Logout")]',
          '//XCUIElementTypeButton[contains(@name,"Logout")]',
          '//*[contains(@name,"Logout")]',
        ];

        let logoutButton: WebdriverIO.Element | null = null;

        for (const selector of logoutSelectors) {
          try {
            const button = await this.driver.$(selector);
            await button.waitForDisplayed({ timeout: 2000 });

            const isClickable = await button.isClickable();
            const buttonName = await button.getAttribute("name");
            console.log(
              `Found logout button with selector: ${selector}, name: "${buttonName}", clickable: ${isClickable}`,
            );

            if (isClickable) {
              logoutButton = button;
              break;
            }
          } catch (selectorError) {
            console.log(`Logout selector ${selector} failed, trying next...`);
          }
        }

        if (!logoutButton) {
          console.log(
            "Could not find logout button with standard selectors, trying fallback...",
          );

          // Fallback: look through all XCUIElementTypeOther elements
          const otherElements = await this.driver.$$("//XCUIElementTypeOther");
          console.log(
            `Found ${otherElements.length} XCUIElementTypeOther elements`,
          );

          for (let i = 0; i < otherElements.length; i++) {
            try {
              const elementName = await otherElements[i].getAttribute("name");
              const isDisplayed = await otherElements[i].isDisplayed();

              if (
                elementName &&
                elementName.includes("Logout") &&
                isDisplayed
              ) {
                console.log(
                  `✓ Found logout element: element ${i} with name "${elementName}"`,
                );

                // Try to click it even if it doesn't report as clickable
                // Some iOS elements don't properly report clickability but are still clickable
                try {
                  // Special handling for the specific logout button
                  if (
                    elementName ===
                    "rectangle.portrait.and.arrow.forward Logout"
                  ) {
                    await otherElements[i].click();
                    console.log(
                      `✓ Successfully clicked specific logout element ${i}`,
                    );
                    logoutButton = otherElements[i];
                    break;
                  }

                  // Check if clickable first for other elements
                  const isClickable = await otherElements[i].isClickable();
                  if (isClickable) {
                    await otherElements[i].click();
                    console.log(
                      `✓ Successfully clicked clickable logout element ${i}`,
                    );
                    logoutButton = otherElements[i];
                    break;
                  }
                } catch (clickError: any) {
                  console.log(
                    `Could not click logout element ${i}: ${clickError.message}`,
                  );
                  continue;
                }
              }
            } catch (elementError) {
              continue;
            }
          }
        }

        if (!logoutButton) {
          throw new Error("Could not find clickable logout button");
        }

        // Click the logout button
        await logoutButton.click();
        console.log(
          "✓ Logout button clicked successfully, waiting for confirmation modal...",
        );

        // Wait for the confirmation modal to appear
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Take a screenshot to debug the modal state
        await this.takeScreenshot("logout-modal-debug.png");

        // The modal should contain "Cancel" and "Logout" buttons
        // Based on the ConfirmationModal component, these are Button components
        console.log("Looking for logout confirmation modal buttons...");

        // Try to find the "Logout" confirmation button (not "Cancel")
        const confirmLogoutSuccess = await this.findAndClickModalLogoutButton();

        if (confirmLogoutSuccess) {
          console.log("✓ Successfully clicked logout confirmation");

          // Wait for navigation back to login screen
          await new Promise((resolve) => setTimeout(resolve, 5000));

          // Verify we're back on login screen with longer timeout
          if (this.driver) {
            try {
              const welcomeText = await this.driver.$(
                '//*[@name="Welcome back" or @text="Welcome back"]',
              );
              await welcomeText.waitForDisplayed({ timeout: 15000 });
              console.log("✓ Logout completed and back on login screen");
            } catch (navigationError) {
              console.log(
                "Warning: Could not verify navigation to login screen, but logout may have succeeded",
              );

              // Check if modal is gone at least
              const modalStillVisible = await this.isElementDisplayed(
                "Are you sure you want to logout?",
                2000,
              );
              if (!modalStillVisible) {
                console.log("✓ Logout modal dismissed successfully");
              } else {
                console.log("Warning: Logout modal still visible");
              }
            }
          }
        } else {
          console.log("⚠️ Could not find/click logout confirmation button");

          // Log current elements for debugging
          const currentElements = await this.getAccessibleElements();
          console.log(
            "Current elements after logout attempt:",
            currentElements.slice(0, 15),
          );

          // Try to wait anyway in case logout completed
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      } else {
        console.log("User not logged in, no logout needed");
      }
    } catch (error) {
      console.log("No logout needed or logout failed:", error);
    }
  }

  // Helper method to find and click the "Logout" button in the confirmation modal
  async findAndClickModalLogoutButton(): Promise<boolean> {
    if (!this.driver) return false;

    console.log("=== MODAL LOGOUT BUTTON DETECTION ===");

    // Wait for modal to fully render
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get ALL elements to understand modal structure
    const allElements = await this.driver!.$$("//*");
    console.log(`Total elements found: ${allElements.length}`);

    // Look for button candidates - elements that might be our Logout button
    let buttonCandidates = [];
    for (let i = 0; i < Math.min(allElements.length, 50); i++) {
      try {
        const element = allElements[i];
        const name = await element.getAttribute("name");
        const value = await element.getAttribute("value");
        const label = await element.getAttribute("label");
        const tagName = await element.getTagName();
        const isDisplayed = await element.isDisplayed();
        const isClickable = await element.isClickable();

        // Look for elements that might be our logout button
        // Special focus on modal buttons - they appear as XCUIElementTypeOther with "Cancel" or "Logout" names
        if (
          isDisplayed &&
          ((name && (name === "Logout" || name === "Cancel")) ||
            (name && (name.includes("Logout") || name.includes("Cancel"))) ||
            (value && (value.includes("Logout") || value.includes("Cancel"))) ||
            (label && (label.includes("Logout") || label.includes("Cancel"))) ||
            isClickable)
        ) {
          const elementInfo = {
            index: i,
            name: name || "",
            value: value || "",
            label: label || "",
            tagName: tagName || "",
            isDisplayed,
            isClickable,
            element,
          };
          buttonCandidates.push(elementInfo);
          console.log(
            `Button candidate ${i}:`,
            JSON.stringify(
              {
                name: elementInfo.name,
                value: elementInfo.value,
                label: elementInfo.label,
                tagName: elementInfo.tagName,
                isDisplayed: elementInfo.isDisplayed,
                isClickable: elementInfo.isClickable,
              },
              null,
              2,
            ),
          );
        }
      } catch (e) {
        // Skip elements we can't inspect
      }
    }

    console.log(`Found ${buttonCandidates.length} button candidates`);

    const approaches = [
      // Approach 1: Target the specific "Logout" button (not Cancel) - exact match
      async () => {
        console.log("Approach 1: Looking for exact 'Logout' button...");

        // Look for exact match "Logout" buttons first
        const exactLogoutCandidates = buttonCandidates.filter(
          (c) => c.name === "Logout",
        );

        console.log(
          `Found ${exactLogoutCandidates.length} exact 'Logout' candidates`,
        );

        for (const candidate of exactLogoutCandidates) {
          try {
            console.log(`Trying to click exact logout candidate:`, candidate);
            await candidate.element.click();
            console.log("✓ Successfully clicked exact logout button");
            return true;
          } catch (e: any) {
            console.log(`Failed to click exact logout candidate: ${e.message}`);
          }
        }

        // If no exact match, try partial matches excluding Cancel
        const logoutCandidates = buttonCandidates.filter(
          (c) =>
            (c.name && c.name.includes("Logout") && c.name !== "Cancel") ||
            (c.value && c.value.includes("Logout") && c.value !== "Cancel") ||
            (c.label && c.label.includes("Logout") && c.label !== "Cancel"),
        );

        console.log(
          `Found ${logoutCandidates.length} partial logout candidates`,
        );

        for (const candidate of logoutCandidates) {
          try {
            console.log(`Trying to click logout candidate:`, candidate);
            await candidate.element.click();
            console.log("✓ Successfully clicked logout button candidate");
            return true;
          } catch (e: any) {
            console.log(`Failed to click logout candidate: ${e.message}`);
          }
        }
        return false;
      },

      // Approach 2: Try XCUIElementTypeOther elements with "Logout" name
      async () => {
        console.log(
          "Approach 2: Looking for XCUIElementTypeOther Logout elements...",
        );

        try {
          // Direct selector for XCUIElementTypeOther with name="Logout"
          const otherLogoutButton = await this.driver!.$(
            '//XCUIElementTypeOther[@name="Logout"]',
          );
          const isDisplayed = await otherLogoutButton.isDisplayed();

          if (isDisplayed) {
            console.log("✓ Found XCUIElementTypeOther with name='Logout'");
            await otherLogoutButton.click();
            console.log(
              "✓ Successfully clicked XCUIElementTypeOther logout button",
            );
            return true;
          }
        } catch (e: any) {
          console.log(`XCUIElementTypeOther approach failed: ${e.message}`);
        }

        return false;
      },

      // Approach 2: Click the rightmost/last clickable button (Logout should be on right)
      async () => {
        console.log("Approach 2: Looking for rightmost clickable button...");

        const clickableCandidates = buttonCandidates.filter(
          (c) => c.isClickable,
        );
        console.log(`Found ${clickableCandidates.length} clickable candidates`);

        if (clickableCandidates.length >= 2) {
          // Try the last clickable button (should be "Logout")
          const rightButton =
            clickableCandidates[clickableCandidates.length - 1];
          try {
            console.log(`Trying to click right button:`, rightButton);
            await rightButton.element.click();
            console.log("✓ Successfully clicked right button");
            return true;
          } catch (e: any) {
            console.log(`Failed to click right button: ${e.message}`);
          }
        }
        return false;
      },

      // Approach 3: Use coordinate-based tap on right side of modal
      async () => {
        console.log("Approach 3: Coordinate-based tap on modal right side...");

        const windowSize = await this.driver!.getWindowSize();

        // Based on the modal screenshot, the buttons are side by side at bottom
        // Modal is centered, so we need to tap the right half
        const modalCenterX = windowSize.width / 2;
        const modalCenterY = windowSize.height / 2;

        // Tap on right side of modal where "Logout" button should be
        const logoutButtonX = modalCenterX + 80; // Right side
        const logoutButtonY = modalCenterY + 60; // Below center in button area

        console.log(
          `Tapping at coordinates (${logoutButtonX}, ${logoutButtonY})`,
        );

        await this.driver!.touchAction({
          action: "tap",
          x: logoutButtonX,
          y: logoutButtonY,
        });

        // Wait and check if modal was dismissed
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const isStillOnModal = await this.isElementDisplayed(
          "Are you sure you want to logout?",
          1000,
        );
        if (!isStillOnModal) {
          console.log("✓ Modal dismissed after coordinate tap");
          return true;
        }

        return false;
      },

      // Approach 4: Try all clickable elements until modal disappears
      async () => {
        console.log("Approach 4: Trying all clickable elements...");

        const clickableCandidates = buttonCandidates.filter(
          (c) => c.isClickable,
        );

        for (const candidate of clickableCandidates) {
          try {
            // Skip if this looks like "Cancel" button
            if (candidate.name && candidate.name.includes("Cancel")) {
              console.log(`Skipping Cancel button: ${candidate.name}`);
              continue;
            }

            console.log(`Trying to click candidate:`, candidate);
            await candidate.element.click();

            // Wait and check if modal was dismissed
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const isStillOnModal = await this.isElementDisplayed(
              "Are you sure you want to logout?",
              1000,
            );
            if (!isStillOnModal) {
              console.log("✓ Modal dismissed after clicking element");
              return true;
            }
          } catch (e: any) {
            console.log(`Failed to click candidate: ${e.message}`);
          }
        }
        return false;
      },
    ];

    // Try each approach
    for (let i = 0; i < approaches.length; i++) {
      try {
        console.log(`Trying modal logout approach ${i + 1}...`);
        const success = await approaches[i]();
        if (success) {
          console.log(`✓ Modal logout approach ${i + 1} succeeded`);
          return true;
        }
      } catch (error: any) {
        console.log(`Modal logout approach ${i + 1} failed: ${error.message}`);
      }
    }

    console.log("⚠️ All modal logout approaches failed");
    return false;
  }

  // Enhanced method to ensure we're on login screen
  async ensureOnLoginScreen(): Promise<void> {
    console.log("Ensuring we're on the login screen...");

    // First check if we're already on login screen
    try {
      const welcomeText = await this.driver!.$(
        '//*[@name="Welcome back" or @text="Welcome back"]',
      );
      const isOnLoginScreen = await welcomeText.isDisplayed();

      if (isOnLoginScreen) {
        console.log("✓ Already on login screen");
        return;
      }
    } catch (error) {
      // Not on login screen, continue with logout
    }

    // If not on login screen, try to logout
    await this.logoutIfLoggedIn();

    // Wait a bit more for the login screen to appear
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify we're now on login screen
    try {
      const welcomeText = await this.driver!.$(
        '//*[@name="Welcome back" or @text="Welcome back"]',
      );
      await welcomeText.waitForDisplayed({ timeout: 10000 });
      console.log("✓ Successfully navigated to login screen");
    } catch (error) {
      console.log("Warning: Could not verify login screen after logout");
    }
  }
}
