import { BaseDriver } from "./BaseDriver";

/**
 * Debugging and utility functions
 */
export class DebugHelpers extends BaseDriver {
  constructor() {
    super();
  }

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

  async waitForLoadingToDisappear(timeout: number = 10000): Promise<void> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    try {
      const loadingElement = await this.driver.$("~loading");
      await loadingElement.waitForDisplayed({ timeout: 2000 });
      await loadingElement.waitForDisplayed({ timeout, reverse: true });
    } catch (error) {
      console.log("Loading element not found or already gone");
    }
  }

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

  async findElementByName(
    name: string,
    timeout: number = 10000,
  ): Promise<WebdriverIO.Element> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }

    const element = await this.driver.$(`//*[@name="${name}"]`);
    await element.waitForDisplayed({ timeout });
    return element;
  }
}
