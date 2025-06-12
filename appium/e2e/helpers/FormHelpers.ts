import { MobileGestures } from "./MobileGestures";

/**
 * Form and input field interactions
 */
export class FormHelpers extends MobileGestures {
  // Enhanced button finding with multiple strategies
  async waitForButton(
    text: string,
    timeout: number = 30000,
  ): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    const selectors = [
      `//XCUIElementTypeButton[@name="${text}"]`,
      `//XCUIElementTypeOther[@name="${text}"]`,
      `//XCUIElementTypeStaticText[@name="${text}"]`,
      `//*[@name="${text}"]`,
      `//*[contains(@name,"${text}")]`,
      // Additional selectors for React Native Button with icons
      `//XCUIElementTypeOther[.//*[@name="${text}"]]`,
      `//XCUIElementTypeButton[.//*[@name="${text}"]]`,
      `//*[.//*[contains(@name,"${text}")]]`,
      // Try finding by the button text within a touchable element
      `//XCUIElementTypeOther[.//XCUIElementTypeStaticText[@name="${text}"]]`,
      `//XCUIElementTypeButton[.//XCUIElementTypeStaticText[@name="${text}"]]`,
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

    // If all selectors fail, try to debug what elements are available
    console.log(
      "❌ All button selectors failed. Debugging available elements...",
    );
    try {
      const allElements = await this.getVisibleElementsForDebugging();
      console.log("Visible elements on screen:", allElements);
    } catch (debugError) {
      console.log("Could not get debug elements:", debugError);
    }

    throw new Error(
      `Could not find button with text "${text}" using any selector`,
    );
  }

  // Debug helper to see what elements are actually available
  async getVisibleElementsForDebugging(): Promise<string[]> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    try {
      const allElements = await this.driver.$$("//*[@name]");
      const visibleElements: string[] = [];

      for (let i = 0; i < Math.min(allElements.length, 20); i++) {
        // Limit to first 20 elements
        try {
          const isDisplayed = await allElements[i].isDisplayed();
          if (isDisplayed) {
            const name = await allElements[i].getAttribute("name");
            if (name && name.trim()) {
              visibleElements.push(name);
            }
          }
        } catch (e) {
          // Skip elements that can't be checked
        }
      }

      return visibleElements;
    } catch (error) {
      console.log("Error getting visible elements:", error);
      return [];
    }
  }

  // Specific method for finding home screen action buttons (Send, Withdraw, Load)
  async findHomeScreenButton(
    buttonText: string,
    timeout: number = 30000,
  ): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    console.log(`Searching for home screen button: "${buttonText}"`);

    // More specific selectors for home screen buttons with icons
    const selectors = [
      // Test ID selectors (most reliable)
      `~${buttonText.toLowerCase()}-button`,
      `//XCUIElementTypeButton[@name="${buttonText.toLowerCase()}-button"]`,
      `//XCUIElementTypeOther[@name="${buttonText.toLowerCase()}-button"]`,

      // Direct button name match
      `//XCUIElementTypeButton[@name="${buttonText}"]`,
      `//XCUIElementTypeOther[@name="${buttonText}"]`,

      // Button containing the text
      `//*[contains(@name,"${buttonText}")]`,

      // TouchableOpacity or similar containing the button text
      `//XCUIElementTypeOther[.//XCUIElementTypeStaticText[@name="${buttonText}"]]`,
      `//XCUIElementTypeButton[.//XCUIElementTypeStaticText[@name="${buttonText}"]]`,

      // Look for icon + text combinations (paperplane.fill Send, etc.)
      `//XCUIElementTypeOther[contains(@name,"paperplane.fill") and contains(@name,"${buttonText}")]`,
      `//XCUIElementTypeOther[contains(@name,"arrow.up.to.line") and contains(@name,"${buttonText}")]`,
      `//XCUIElementTypeOther[contains(@name,"arrow.down.to.line") and contains(@name,"${buttonText}")]`,

      // Fallback: any element containing the button text
      `//*[@name="${buttonText}"]`,
      `//*[text()="${buttonText}"]`,
    ];

    for (const selector of selectors) {
      try {
        const element = await this.driver.$(selector);
        await element.waitForDisplayed({ timeout: 3000 });

        // Verify the element is actually clickable
        const isClickable = await element.isClickable();
        if (isClickable) {
          console.log(
            `✓ Found clickable home button using selector: ${selector}`,
          );
          return element;
        } else {
          console.log(
            `Found element but not clickable with selector: ${selector}`,
          );
        }
      } catch (error) {
        console.log(`Home button selector ${selector} failed, trying next...`);
      }
    }

    // If still not found, try a broader search
    console.log(`Attempting broader search for "${buttonText}" button...`);
    try {
      const allButtons = await this.driver.$$(
        '//XCUIElementTypeButton | //XCUIElementTypeOther[@accessible="true"]',
      );

      for (const button of allButtons) {
        try {
          const isDisplayed = await button.isDisplayed();
          const isClickable = await button.isClickable();

          if (isDisplayed && isClickable) {
            const name = await button.getAttribute("name");
            const label = await button.getAttribute("label");

            if (
              (name && name.includes(buttonText)) ||
              (label && label.includes(buttonText))
            ) {
              console.log(
                `✓ Found home button via broad search with name/label: ${name || label}`,
              );
              return button;
            }
          }
        } catch (e) {
          // Skip this button and continue
        }
      }
    } catch (broadSearchError) {
      console.log("Broad search failed:", broadSearchError);
    }

    throw new Error(
      `Could not find home screen button with text "${buttonText}"`,
    );
  }

  // Enhanced text input finding
  async waitForTextInput(
    identifier: string,
    timeout: number = 30000,
  ): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    try {
      const textFieldSelector = `//XCUIElementTypeTextField[@name="${identifier}"]`;
      const textField = await this.driver.$(textFieldSelector);
      await textField.waitForDisplayed({ timeout: 5000 });
      return textField;
    } catch (error) {
      try {
        const secureFieldSelector = `//XCUIElementTypeSecureTextField[@name="${identifier}"]`;
        const secureField = await this.driver.$(secureFieldSelector);
        await secureField.waitForDisplayed({ timeout: 5000 });
        return secureField;
      } catch (secureError) {
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

  // Specific field finders
  async findEmailField(timeout: number = 30000): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    try {
      const textFields = await this.driver.$$("//XCUIElementTypeTextField");

      for (let i = 0; i < textFields.length; i++) {
        try {
          const text = await textFields[i].getText();
          console.log(`Text field ${i}: "${text}"`);
          if (text === "Email" || text === "" || text === "email") {
            const isDisplayed = await textFields[i].isDisplayed();
            if (isDisplayed) {
              return textFields[i];
            }
          }
        } catch (e: any) {
          console.log(`Could not get text from text field ${i}:`, e.message);
        }
      }

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

  async findPasswordField(
    timeout: number = 30000,
  ): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    try {
      const secureFields = await this.driver.$$(
        "//XCUIElementTypeSecureTextField",
      );

      for (let i = 0; i < secureFields.length; i++) {
        try {
          const text = await secureFields[i].getText();
          console.log(`Secure field ${i}: "${text}"`);
          if (text === "Password" || text === "" || text === "password") {
            const isDisplayed = await secureFields[i].isDisplayed();
            if (isDisplayed) {
              return secureFields[i];
            }
          }
        } catch (e: any) {
          console.log(`Could not get text from secure field ${i}:`, e.message);
        }
      }

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

  // Enhanced form filling with keyboard management
  async fillTextAndDismissKeyboard(
    selector: string,
    text: string,
    timeout: number = 30000,
  ): Promise<void> {
    const element = await this.waitForElement(selector, timeout);
    await element.click();
    await element.clearValue();
    await element.setValue(text);

    await new Promise((resolve) => setTimeout(resolve, 500));
    await this.dismissKeyboard();
  }

  async fillEmailField(email: string): Promise<void> {
    console.log("Finding and filling email field...");
    const emailField = await this.findEmailField();
    await emailField.click();
    await emailField.clearValue();
    await emailField.setValue(email);

    await new Promise((resolve) => setTimeout(resolve, 500));
    await this.dismissKeyboard();
    console.log("✓ Email field filled and keyboard dismissed");
  }

  async fillPasswordField(password: string): Promise<void> {
    console.log("Finding and filling password field...");
    const passwordField = await this.findPasswordField();
    await passwordField.click();
    await passwordField.clearValue();
    await passwordField.setValue(password);

    await new Promise((resolve) => setTimeout(resolve, 500));
    await this.dismissKeyboard();
    console.log("✓ Password field filled and keyboard dismissed");
  }

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

  // Send Money specific helper methods
  async findMoneyInputField(
    timeout: number = 30000,
  ): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    try {
      // Look for money input field near the $ symbol
      const selectors = [
        '//XCUIElementTypeTextField[preceding-sibling::*[contains(@name,"$")] or following-sibling::*[contains(@name,"$")]]',
        '//XCUIElementTypeTextField[@placeholder="0"]',
        '//XCUIElementTypeTextField[contains(@name,"money") or contains(@name,"amount")]',
        "//XCUIElementTypeTextField[1]", // First text field on the page
      ];

      for (const selector of selectors) {
        try {
          const element = await this.driver.$(selector);
          await element.waitForDisplayed({ timeout: 3000 });
          console.log(`Found money input using selector: ${selector}`);
          return element;
        } catch (error) {
          console.log(
            `Money input selector ${selector} failed, trying next...`,
          );
        }
      }

      // Fallback: find all text fields and return the first one
      const textFields = await this.driver.$$("//XCUIElementTypeTextField");
      if (textFields.length > 0) {
        const firstField = textFields[0];
        const isDisplayed = await firstField.isDisplayed();
        if (isDisplayed) {
          console.log("Using first text field as money input");
          return firstField;
        }
      }

      throw new Error("No suitable money input field found");
    } catch (error: any) {
      throw new Error(`Could not find money input field: ${error.message}`);
    }
  }

  async findInputByPlaceholder(
    placeholder: string,
    timeout: number = 30000,
  ): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    const selectors = [
      `//XCUIElementTypeTextField[@placeholder="${placeholder}"]`,
      `//XCUIElementTypeSecureTextField[@placeholder="${placeholder}"]`,
      `//XCUIElementTypeTextField[contains(@placeholder,"${placeholder}")]`,
      `//XCUIElementTypeSecureTextField[contains(@placeholder,"${placeholder}")]`,
    ];

    for (const selector of selectors) {
      try {
        const element = await this.driver.$(selector);
        await element.waitForDisplayed({ timeout: 3000 });
        console.log(`Found input with placeholder using selector: ${selector}`);
        return element;
      } catch (error) {
        console.log(`Placeholder selector ${selector} failed, trying next...`);
      }
    }

    throw new Error(`Could not find input with placeholder "${placeholder}"`);
  }

  async findElementByTestId(
    testId: string,
    timeout: number = 30000,
  ): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    const selectors = [
      `//XCUIElementTypeOther[@name="${testId}"]`,
      `//XCUIElementTypeButton[@name="${testId}"]`,
      `//*[@name="${testId}"]`,
      `//XCUIElementTypeOther[@testID="${testId}"]`,
      `//XCUIElementTypeButton[@testID="${testId}"]`,
      `//*[@testID="${testId}"]`,
      `//XCUIElementTypeOther[@accessibilityLabel="${testId}"]`,
      `//XCUIElementTypeButton[@accessibilityLabel="${testId}"]`,
      `//*[@accessibilityLabel="${testId}"]`,
    ];

    for (const selector of selectors) {
      try {
        const element = await this.driver.$(selector);
        await element.waitForDisplayed({ timeout: 3000 });
        console.log(`Found element by testId using selector: ${selector}`);
        return element;
      } catch (error) {
        console.log(`TestId selector ${selector} failed, trying next...`);
      }
    }

    throw new Error(`Could not find element with testID "${testId}"`);
  }

  // Helper method for finding back button specifically
  async findBackButton(timeout: number = 30000): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    // Use coordinate tap directly since testID is not working reliably for back buttons on iOS
    console.log(
      "Using coordinate tap for back button (faster and more reliable)",
    );
    await this.tapOnCoordinates(50, 100); // Top-left area where back button is located

    // Return a mock element that indicates success
    // This is a workaround since coordinate tap doesn't return an element
    return {
      click: async () => {
        // Already clicked via coordinate tap above
        console.log("✓ Back button clicked via coordinates");
      },
    } as WebdriverIO.Element;
  }

  async findElementByAccessibilityId(
    accessibilityId: string,
    timeout: number = 30000,
  ): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    const selectors = [
      `~${accessibilityId}`,
      `//*[@accessibilityId="${accessibilityId}"]`,
      `//*[@name="${accessibilityId}"]`,
      `//*[contains(@name,"${accessibilityId}")]`,
    ];

    for (const selector of selectors) {
      try {
        const element = await this.driver.$(selector);
        await element.waitForDisplayed({ timeout: 3000 });
        console.log(
          `Found element by accessibility ID using selector: ${selector}`,
        );
        return element;
      } catch (error) {
        console.log(
          `AccessibilityId selector ${selector} failed, trying next...`,
        );
      }
    }

    throw new Error(
      `Could not find element with accessibilityId "${accessibilityId}"`,
    );
  }

  async isElementDisabled(element: WebdriverIO.Element): Promise<boolean> {
    try {
      // For iOS, check the 'enabled' attribute (opposite of disabled)
      const isEnabled = await element.getAttribute("enabled");
      if (isEnabled === "false") {
        return true; // Element is disabled
      }
      if (isEnabled === "true") {
        return false; // Element is enabled
      }

      // Fallback: try isEnabled() method
      const isEnabledMethod = await element.isEnabled();
      return !isEnabledMethod;
    } catch (error: any) {
      console.log(`Could not determine disabled state: ${error.message}`);
      // If we can't determine the state, assume it's enabled
      return false;
    }
  }

  async isElementDisplayed(
    elementOrText: string | WebdriverIO.Element,
    timeout: number = 5000,
  ): Promise<boolean> {
    try {
      if (!this.driver) {
        throw new Error("Driver not initialized");
      }

      if (typeof elementOrText === "string") {
        // It's a text string, find the element first
        const element = await this.driver.$(
          `//*[@text="${elementOrText}" or @label="${elementOrText}" or @name="${elementOrText}"]`,
        );
        await element.waitForDisplayed({ timeout });
        return true;
      } else {
        // It's already an element
        await elementOrText.waitForDisplayed({ timeout });
        return true;
      }
    } catch (error) {
      return false;
    }
  }

  // Simplified back navigation using coordinates (faster and more reliable)
  async navigateBack(delay: number): Promise<void> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    console.log("Navigating back using coordinate tap");
    // Wait for the specified delay before tapping
    await new Promise((resolve) => setTimeout(resolve, delay));
    await this.tapOnCoordinates(50, 100); // Top-left area where back button is located
    console.log("✓ Back navigation completed");
  }
}
