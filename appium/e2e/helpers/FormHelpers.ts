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
}
