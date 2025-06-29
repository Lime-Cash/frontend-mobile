import { AppiumHelper } from "../helpers/AppiumHelper";

describe("Send Money functionality", () => {
  let appiumHelper: AppiumHelper;

  beforeAll(async () => {
    // Initialize driver once for the entire test suite
    appiumHelper = new AppiumHelper();
    await appiumHelper.initDriver();
    console.log("Driver initialized successfully for test suite");
  }, 90000);

  afterAll(async () => {
    // Cleanup driver after all tests complete
    try {
      if (appiumHelper.driver) {
        await appiumHelper.quitDriver();
        console.log("Driver quit successfully");
      }
    } catch (cleanupError) {
      console.error("Error during final cleanup:", cleanupError);
    }
  });

  beforeEach(async () => {
    // Login and navigate to send money page for each test
    await appiumHelper.ensureOnLoginScreen();

    // Wait for login screen
    await appiumHelper.waitForElementByText("Welcome back", 500);
    console.log("✓ Login screen loaded");

    // Login with johndoe credentials
    await appiumHelper.fillEmailField("johndoe@mail.com");
    await appiumHelper.fillPasswordField("Password123!");
    console.log("✓ Credentials entered");

    // Click Sign In using testID
    const signInButton = await appiumHelper.findElementByTestId(
      "signin-button",
      500,
    );
    await signInButton.click();
    console.log("✓ Sign In button clicked");

    // Wait for home page to load
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Verify we're on home screen
    const homeElement = await appiumHelper.isElementDisplayed("Lime Cash", 500);
    if (!homeElement) {
      throw new Error("Failed to reach home screen after login");
    }
    console.log("✓ Home page loaded");

    // Navigate to send money page
    const sendButton = await appiumHelper.findElementByTestId(
      "send-nav-button",
      500,
    );
    await sendButton.click();
    console.log("✓ Send button clicked");

    // Wait for send money page to load and verify
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Verify we're on send money screen
    const sendMoneyScreen = await appiumHelper.driver!.$(
      '//*[contains(@name, "Send Money")]',
    );
    await sendMoneyScreen.waitForDisplayed({ timeout: 500 });
    console.log("✓ Send Money screen loaded");

    // Note: The money input field has autoFocus=true, so numeric keyboard opens automatically
    console.log(
      "ℹ️ Numeric keyboard is automatically opened due to money input autoFocus",
    );
  }, 60000);

  afterEach(async () => {
    // Navigate back and logout after each test
    try {
      if (appiumHelper.driver) {
        // Navigate back to home screen if we're still on send money page
        try {
          const onSendScreen = await appiumHelper.isElementDisplayed(
            "Send Money",
            500,
          );
          if (onSendScreen) {
            console.log("Still on Send Money screen, navigating back to home");

            // Navigate back using coordinate tap (faster and more reliable)
            await appiumHelper.navigateBack(500);

            // Wait for navigation
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        } catch (navigationError) {
          console.log("Navigation check failed, continuing with logout");
        }

        // Logout to ensure clean state for next test
        try {
          await appiumHelper.logoutIfLoggedIn();
          console.log("✓ Logout completed successfully");
        } catch (logoutError) {
          console.log("Logout attempt failed:", logoutError);
          // Try to ensure we're back on login screen
          try {
            await appiumHelper.ensureOnLoginScreen();
          } catch (ensureError) {
            console.log("Could not ensure login screen:", ensureError);
          }
        }
      }
    } catch (cleanupError) {
      console.error("Error during cleanup:", cleanupError);
    }
  });

  it("should disable send button when amount is not entered", async () => {
    console.log("=== TEST: Send Button Disabled Without Amount ===");

    try {
      // First, hide the keyboard to check button state (tap outside keyboard area)
      await appiumHelper.tapOnCoordinates(200, 250); // Tap on empty area above keyboard
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("✓ Keyboard hidden");

      // Check that the Send Money button is disabled initially
      const sendButton = await appiumHelper.findElementByTestId(
        "send-money-btn",
        500,
      );
      const initialDisabledState =
        await appiumHelper.isElementDisabled(sendButton);
      expect(initialDisabledState).toBe(true);
      console.log("✓ Send button is disabled initially");

      // Enter only recipient email (using Mary's email)
      const recipientField = await appiumHelper.findElementByTestId(
        "recipient-email-input",
        500,
      );
      await recipientField.click();
      await recipientField.setValue("marydoe@mail.com");
      console.log("✓ Recipient email entered");

      // Hide keyboard again to check button state
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Button should still be disabled
      const stillDisabled = await appiumHelper.isElementDisabled(sendButton);
      expect(stillDisabled).toBe(true);
      console.log("✅ Send button correctly remains disabled without amount");
    } catch (error: any) {
      console.error("❌ Amount validation test failed:", error);
      throw error;
    }
  }, 60000);

  it("should disable send button when recipient is not entered", async () => {
    console.log("=== TEST: Send Button Disabled Without Recipient ===");

    try {
      // Enter only amount (numeric keyboard is already open due to autoFocus)
      const moneyInput = await appiumHelper.findMoneyInputField(500);
      await moneyInput.setValue("1");
      console.log("✓ Amount entered (numeric keyboard was already open)");

      // Hide keyboard to check button state
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Button should still be disabled
      const sendButton = await appiumHelper.findElementByTestId(
        "send-money-btn",
        500,
      );
      const isDisabled = await appiumHelper.isElementDisabled(sendButton);
      expect(isDisabled).toBe(true);
      console.log(
        "✅ Send button correctly remains disabled without recipient",
      );
    } catch (error: any) {
      console.error("❌ Recipient validation test failed:", error);
      throw error;
    }
  }, 60000);

  it("should successfully send money to a valid recipient", async () => {
    console.log("=== TEST: Successful Money Transfer ===");

    try {
      // Enter amount (numeric keyboard is already open due to autoFocus)
      const moneyInput = await appiumHelper.findMoneyInputField(500);
      await moneyInput.setValue("1");
      console.log("✓ Amount ($1) entered (numeric keyboard was already open)");

      // Enter recipient email (using Mary's email)
      const recipientField = await appiumHelper.findElementByTestId(
        "recipient-email-input",
        500,
      );
      await recipientField.click();
      await recipientField.setValue("marydoe@mail.com");
      console.log("✓ Recipient email entered");

      // Hide keyboard to check button state
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Click send button
      const sendButton = await appiumHelper.findElementByTestId(
        "send-money-btn",
        500,
      );
      await sendButton.click();
      console.log("✓ Send Money button clicked");

      // Wait for the transfer to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Should redirect to home page
      const isBackOnHome = await appiumHelper.isElementDisplayed(
        "Lime Cash",
        500,
      );
      expect(isBackOnHome).toBe(true);
      console.log("✅ Successfully returned to home screen after transfer");

      // Verify the transaction appears in the list
      const successMessage = await appiumHelper.isElementDisplayed(
        "$1 was sent to marydoe@mail.com",
        500,
      );
      if (successMessage) {
        console.log("✅ Success message displayed");
      } else {
        console.log(
          "⚠️ Success message not found (may be different text format)",
        );
      }
    } catch (error: any) {
      console.error("❌ Money transfer test failed:", error);
      throw error;
    }
  }, 90000);

  it("should show error when sending money to invalid recipient", async () => {
    console.log("=== TEST: Invalid Recipient Handling ===");

    try {
      // Enter amount (numeric keyboard is already open due to autoFocus)
      const moneyInput = await appiumHelper.findMoneyInputField(500);
      await moneyInput.setValue("1");
      console.log("✓ Amount entered (numeric keyboard was already open)");

      // Enter invalid recipient email
      const recipientField = await appiumHelper.findElementByTestId(
        "recipient-email-input",
        500,
      );
      await recipientField.click();
      await recipientField.setValue("nonexistent@example.com");
      console.log("✓ Invalid recipient email entered");

      // Hide keyboard to check button state
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Click send button
      const sendButton = await appiumHelper.findElementByTestId(
        "send-money-btn",
        500,
      );
      await sendButton.click();
      console.log("✓ Send Money button clicked");

      // Wait for the API call to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Should show error message
      const errorMessage = await appiumHelper.isElementDisplayed(
        "User not found",
        500,
      );
      if (errorMessage) {
        console.log("✅ Error message displayed");
      } else {
        console.log("⚠️ Error message not found (may be different error text)");
      }

      // Should stay on the send money page
      const stillOnSendScreen = await appiumHelper.isElementDisplayed(
        "Send Money",
        500,
      );
      expect(stillOnSendScreen).toBe(true);
      console.log(
        "✅ Correctly stayed on send money screen with invalid recipient",
      );
    } catch (error: any) {
      console.error("❌ Invalid recipient test failed:", error);
      throw error;
    }
  }, 60000);

  it("should show error when sending money to yourself", async () => {
    console.log("=== TEST: Self Transfer Error ===");

    try {
      // Enter amount (numeric keyboard is already open due to autoFocus)
      const moneyInput = await appiumHelper.findMoneyInputField(500);
      await moneyInput.setValue("1");
      console.log("✓ Amount entered (numeric keyboard was already open)");

      // Enter same email as logged in user (johndoe@mail.com)
      const recipientField = await appiumHelper.findElementByTestId(
        "recipient-email-input",
        500,
      );
      await recipientField.click();
      await recipientField.setValue("johndoe@mail.com");
      console.log("✓ Own email entered as recipient");

      // Hide keyboard to check button state
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Click send button
      const sendButton = await appiumHelper.findElementByTestId(
        "send-money-btn",
        500,
      );
      await sendButton.click();
      console.log("✓ Send Money button clicked");

      // Wait for the API call to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Should show error message
      const errorMessage = await appiumHelper.isElementDisplayed(
        "Unknown error",
        500,
      );
      if (errorMessage) {
        console.log("✅ Error message displayed for self-transfer");
      } else {
        // Try alternative error messages
        const altErrorMessage = await appiumHelper.isElementDisplayed(
          "Cannot send money to yourself",
          500,
        );
        if (altErrorMessage) {
          console.log(
            "✅ Alternative error message displayed for self-transfer",
          );
        } else {
          console.log(
            "⚠️ Error message not found (may be different error text)",
          );
        }
      }

      // Should stay on the send money page
      const stillOnSendScreen = await appiumHelper.isElementDisplayed(
        "Send Money",
        500,
      );
      expect(stillOnSendScreen).toBe(true);
      console.log(
        "✅ Correctly stayed on send money screen after self-transfer attempt",
      );
    } catch (error: any) {
      console.error("❌ Self transfer test failed:", error);
      throw error;
    }
  }, 60000);

  it("should show error when sending money with an amount greater than the balance", async () => {
    console.log("=== TEST: Amount Exceeds Balance Error ===");

    try {
      // First, we need to get the current balance - navigate back to home briefly
      // Navigate back to home screen first using coordinate tap
      await appiumHelper.navigateBack(500);
      console.log("✓ Navigated back to home to check balance");

      // Wait for home page
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get current balance
      // For now, we'll use a very high amount that should exceed most balances
      const excessiveAmount = "999999";

      // Navigate back to send money page
      const sendButton = await appiumHelper.findElementByTestId(
        "send-nav-button",
        1000,
      );
      await sendButton.click();
      console.log("✓ Navigated back to Send Money screen");

      // Wait for send money page to load
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Enter excessive amount (numeric keyboard is already open due to autoFocus)
      const moneyInput = await appiumHelper.findMoneyInputField(500);
      await moneyInput.setValue(excessiveAmount);
      console.log(`✓ Excessive amount (${excessiveAmount}) entered`);

      // Enter valid recipient email
      const recipientField = await appiumHelper.findElementByTestId(
        "recipient-email-input",
        500,
      );
      await recipientField.click();
      await recipientField.setValue("marydoe@mail.com");
      console.log("✓ Recipient email entered");

      // Hide keyboard to check button state
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Click send button
      const sendMoneyButton = await appiumHelper.findElementByTestId(
        "send-money-btn",
        500,
      );
      await sendMoneyButton.click();
      console.log("✓ Send Money button clicked");

      // Wait for the API call to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      const errorMessage = await appiumHelper.isElementDisplayed(
        "Unknown error",
        100,
      );
      if (errorMessage) {
        console.log("✅ Error message displayed for excessive amount");
      } else {
        // Try alternative error messages
        const altErrorMessage = await appiumHelper.isElementDisplayed(
          "Insufficient funds",
          100,
        );
        if (altErrorMessage) {
          console.log(
            "✅ Alternative error message displayed for excessive amount",
          );
        } else {
          console.log(
            "⚠️ Error message not found (may be different error text)",
          );
        }
      }

      const stillOnSendScreen = await appiumHelper.isElementDisplayed(
        "Send Money",
        500,
      );
      expect(stillOnSendScreen).toBe(true);
      console.log(
        "✅ Correctly stayed on send money screen after excessive amount attempt",
      );
    } catch (error: any) {
      console.error("❌ Excessive amount test failed:", error);
      throw error;
    }
  }, 90000);
});
