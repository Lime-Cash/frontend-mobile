import { FormHelpers } from "./FormHelpers";
import { DebugHelpers } from "./DebugHelpers";

/**
 * App-specific authentication workflows
 */
export class AuthActions extends FormHelpers {
  protected debugHelpers = new DebugHelpers(); // Changed to protected for inheritance

  async registerToLogin(): Promise<void> {
    if (!this.driver) {
      throw new Error("Driver not initialized");
    }
    console.log("Starting registration to login flow...");
    try {
      // Wait for the registration button to be displayed
      const signInLink = await this.driver.$(
        '//*[@name="Sign in" or @text="Sign in"]',
      );
      await signInLink.waitForDisplayed({ timeout: 10000 });
      console.log("✓ Sign in link found, clicking...");

      // Click the sign in link
      await signInLink.click();

      // Wait for the login screen to appear
      const welcomeText = await this.driver.$(
        '//*[@name="Welcome back" or @text="Welcome back"]',
      );
      await welcomeText.waitForDisplayed({ timeout: 10000 });
      console.log(
        "✓ Successfully navigated to login screen after registration",
      );
    } catch (error) {
      console.error("Error during registration to login flow:", error);
      throw new Error("Failed to complete registration to login flow");
    }
  }

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

        // Find and click logout button
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
          logoutButton = await this.findLogoutButtonFallback();
        }

        if (!logoutButton) {
          throw new Error("Could not find clickable logout button");
        }

        // Click the logout button
        await logoutButton.click();
        console.log(
          "✓ Logout button clicked successfully, waiting for confirmation modal...",
        );

        // Wait for the confirmation modal
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Handle confirmation modal
        const confirmLogoutSuccess = await this.findAndClickModalLogoutButton();

        if (confirmLogoutSuccess) {
          console.log("✓ Successfully clicked logout confirmation");
          await this.waitForLoginScreen();
        } else {
          console.log("⚠️ Could not find/click logout confirmation button");
        }
      } else {
        console.log("User not logged in, no logout needed");
      }
    } catch (error) {
      console.log("No logout needed or logout failed:", error);
    }
  }

  private async findLogoutButtonFallback(): Promise<WebdriverIO.Element | null> {
    if (!this.driver) return null;

    console.log(
      "Could not find logout button with standard selectors, trying fallback...",
    );

    const otherElements = await this.driver.$$("//XCUIElementTypeOther");
    console.log(`Found ${otherElements.length} XCUIElementTypeOther elements`);

    for (let i = 0; i < otherElements.length; i++) {
      try {
        const elementName = await otherElements[i].getAttribute("name");
        const isDisplayed = await otherElements[i].isDisplayed();

        if (elementName && elementName.includes("Logout") && isDisplayed) {
          console.log(
            `✓ Found logout element: element ${i} with name "${elementName}"`,
          );

          try {
            if (elementName === "rectangle.portrait.and.arrow.forward Logout") {
              await otherElements[i].click();
              console.log(
                `✓ Successfully clicked specific logout element ${i}`,
              );
              return otherElements[i];
            }

            const isClickable = await otherElements[i].isClickable();
            if (isClickable) {
              await otherElements[i].click();
              console.log(
                `✓ Successfully clicked clickable logout element ${i}`,
              );
              return otherElements[i];
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

    return null;
  }

  private async findAndClickModalLogoutButton(): Promise<boolean> {
    if (!this.driver) return false;

    console.log("=== MODAL LOGOUT BUTTON DETECTION ===");

    // Wait for modal to fully render
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const approaches = [
      // Approach 1: Direct logout button selector
      async () => {
        console.log("Approach 1: Looking for exact 'Logout' button...");
        try {
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

      // Approach 2: Coordinate-based tap
      async () => {
        console.log("Approach 2: Coordinate-based tap on modal right side...");
        const windowSize = await this.driver!.getWindowSize();

        const modalCenterX = windowSize.width / 2;
        const modalCenterY = windowSize.height / 2;
        const logoutButtonX = modalCenterX + 80;
        const logoutButtonY = modalCenterY + 60;

        console.log(
          `Tapping at coordinates (${logoutButtonX}, ${logoutButtonY})`,
        );

        await this.driver!.touchAction({
          action: "tap",
          x: logoutButtonX,
          y: logoutButtonY,
        });

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

  private async waitForLoginScreen(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 5000));

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
  }

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
    console.log("✓ Logged out successfully, now on login screen");

    await this.registerToLogin();
    console.log("✓ Successfully navigated to login screen");

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
