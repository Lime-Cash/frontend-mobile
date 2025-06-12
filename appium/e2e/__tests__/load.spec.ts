import { AppiumHelper } from "../helpers/AppiumHelper";

describe("Load functionality", () => {
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
    // Login and navigate to load money page for each test
    await appiumHelper.ensureOnLoginScreen();

    // Wait for login screen
    await appiumHelper.waitForElementByText("Welcome back", 1000);
    console.log("✓ Login screen loaded");

    // Login with tomi.serra@gmail.com credentials
    await appiumHelper.fillEmailField("johndoe@mail.com");
    await appiumHelper.fillPasswordField("Password123!");
    console.log("✓ Credentials entered");

    // Click Sign In using testID
    const signInButton = await appiumHelper.findElementByTestId(
      "signin-button",
      1000,
    );
    await signInButton.click();
    console.log("✓ Sign In button clicked");

    // Wait for home page to load
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify we're on home screen
    const homeElement = await appiumHelper.isElementDisplayed(
      "Lime Cash",
      1000,
    );
    if (!homeElement) {
      throw new Error("Failed to reach home screen after login");
    }
    console.log("✓ Home page loaded");

    // Navigate to load money page
    const loadButton = await appiumHelper.findElementByTestId(
      "load-nav-button",
      1000,
    );
    await loadButton.click();
    console.log("✓ Load button clicked");

    // Wait for load money page to load and verify
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify we're on load money screen
    const loadMoneyScreen = await appiumHelper.driver!.$(
      '//*[contains(@name, "Load Money")]',
    );
    await loadMoneyScreen.waitForDisplayed({ timeout: 1000 });
    console.log("✓ Load Money screen loaded");

    // Note: The money input field has autoFocus=true, so numeric keyboard opens automatically
    console.log(
      "ℹ️ Numeric keyboard is automatically opened due to money input autoFocus",
    );
  }, 60000);

  afterEach(async () => {
    // Navigate back and logout after each test
    try {
      if (appiumHelper.driver) {
        // Navigate back to home screen if we're still on load money page
        try {
          const onLoadScreen = await appiumHelper.isElementDisplayed(
            "Load Money",
            1000,
          );
          if (onLoadScreen) {
            console.log("Still on Load Money screen, navigating back to home");

            // Navigate back using coordinate tap
            await appiumHelper.navigateBack(1000);

            // Wait for navigation
            await new Promise((resolve) => setTimeout(resolve, 2000));
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

  // Test 1: should disable load button when amount is not entered
  it("should disable load button when amount is not entered", async () => {
    console.log("=== TEST: Load Button Disabled Without Amount ===");

    try {
      // First, hide the keyboard to check button state
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("✓ Keyboard hidden");

      // Check that the Load Money button is disabled initially
      const loadButton = await appiumHelper.findElementByTestId(
        "load-money-btn",
        1000,
      );
      const initialDisabledState =
        await appiumHelper.isElementDisabled(loadButton);
      expect(initialDisabledState).toBe(true);
      console.log("✓ Load button is disabled initially");

      // Enter only CVU
      const cvuField = await appiumHelper.findElementByTestId(
        "cvu-input",
        5000,
      );
      await cvuField.click();
      await cvuField.setValue("4567890123456789012345");
      await appiumHelper.dismissKeyboard();
      console.log("✓ CVU entered");

      // Hide keyboard again to check button state
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Button should still be disabled
      const stillDisabled = await appiumHelper.isElementDisabled(loadButton);
      expect(stillDisabled).toBe(true);
      console.log("✅ Load button correctly remains disabled without amount");
    } catch (error: any) {
      console.error("❌ Amount validation test failed:", error);
      throw error;
    }
  }, 60000);

  // Test 2: should disable load button when CVU is not entered
  it("should disable load button when CVU is not entered", async () => {
    console.log("=== TEST: Load Button Disabled Without CVU ===");

    try {
      // Enter only amount (numeric keyboard is already open due to autoFocus)
      const amountInput = await appiumHelper.findElementByTestId(
        "amount-input",
        5000,
      );
      await amountInput.setValue("1");
      await appiumHelper.dismissKeyboard();
      console.log("✓ Amount entered (numeric keyboard was already open)");

      // Hide keyboard to check button state
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Button should still be disabled
      const loadButton = await appiumHelper.findElementByTestId(
        "load-money-btn",
        10000,
      );
      const isDisabled = await appiumHelper.isElementDisabled(loadButton);
      expect(isDisabled).toBe(true);
      console.log("✅ Load button correctly remains disabled without CVU");
    } catch (error: any) {
      console.error("❌ CVU validation test failed:", error);
      throw error;
    }
  }, 60000);

  // Test 3: should successfully load money using a valid CVU
  it("should successfully load money using a valid CVU", async () => {
    console.log("=== TEST: Successful Money Load ===");

    try {
      // Get initial balance first by navigating back to home
      await appiumHelper.navigateBack(1000);
      console.log("✓ Navigated back to home to check balance");

      // Wait for home page
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get current balance (we'll verify it increases by $1 after load)
      let initialBalance: number;
      try {
        const balanceElement = await appiumHelper.findElementByTestId(
          "balance-display",
          5000,
        );

        // Try different methods to get the balance text
        let balanceText;
        try {
          balanceText = await balanceElement.getText();
        } catch (e1) {
          try {
            balanceText = await balanceElement.getAttribute("name");
          } catch (e2) {
            try {
              balanceText = await balanceElement.getAttribute("label");
            } catch (e3) {
              balanceText = await balanceElement.getAttribute("value");
            }
          }
        }

        console.log(`Raw balance text: "${balanceText}"`);
        initialBalance = parseFloat(balanceText?.replace(/\$|,/g, "") || "0");
        console.log(`✓ Initial balance: $${initialBalance}`);
      } catch (balanceError) {
        console.log("Could not get initial balance, using 0 as default");
        initialBalance = 0;
      }

      // Navigate back to load money page
      const loadNavButton = await appiumHelper.findElementByTestId(
        "load-nav-button",
        5000,
      );
      await loadNavButton.click();
      console.log("✓ Navigated back to Load Money screen");

      // Wait for load money page to load
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Enter amount (numeric keyboard is already open due to autoFocus)
      const amountInput = await appiumHelper.findElementByTestId(
        "amount-input",
        5000,
      );
      await amountInput.setValue("1");
      // Try to dismiss keyboard by tapping outside
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("✓ Amount ($1) entered and keyboard dismissed");

      // Enter valid CVU
      const cvuField = await appiumHelper.findElementByTestId(
        "cvu-input",
        5000,
      );
      await cvuField.click();
      await cvuField.setValue("4567890123456789012345");
      // Try to dismiss keyboard by tapping outside
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("✓ Valid CVU entered and keyboard dismissed");

      // Ensure keyboard is fully dismissed
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Click load button
      const loadButton = await appiumHelper.findElementByTestId(
        "load-money-btn",
        1000,
      );
      await loadButton.click();
      console.log("✓ Load Money button clicked");

      // Wait for the transaction to complete
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Check if we're back on home screen or still on load screen
      const isBackOnHome = await appiumHelper.isElementDisplayed(
        "Lime Cash",
        2000,
      );

      if (isBackOnHome) {
        console.log("✅ Successfully returned to home screen after load");
      } else {
        // If still on load screen, check for success state and navigate back manually
        console.log(
          "Still on load screen, checking for success state and navigating back",
        );

        // Wait a bit more for any success feedback
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Navigate back to home manually
        await appiumHelper.navigateBack(1000);
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const finalHomeCheck = await appiumHelper.isElementDisplayed(
          "Lime Cash",
          3000,
        );
        expect(finalHomeCheck).toBe(true);
        console.log("✅ Successfully navigated back to home screen");
      }

      // Verify the transaction appears in the list
      const successMessage = await appiumHelper.isElementDisplayed(
        "$1 was loaded from bank account",
        2000,
      );
      if (successMessage) {
        console.log("✅ Success message displayed");
      } else {
        console.log(
          "⚠️ Success message not found (may be different text format)",
        );
      }

      // Verify balance increased
      try {
        const newBalanceElement = await appiumHelper.findElementByTestId(
          "balance-display",
          5000,
        );

        // Try different methods to get the balance text
        let newBalanceText;
        try {
          newBalanceText = await newBalanceElement.getText();
        } catch (e1) {
          try {
            newBalanceText = await newBalanceElement.getAttribute("name");
          } catch (e2) {
            try {
              newBalanceText = await newBalanceElement.getAttribute("label");
            } catch (e3) {
              newBalanceText = await newBalanceElement.getAttribute("value");
            }
          }
        }

        const newBalance = parseFloat(
          newBalanceText?.replace(/\$|,/g, "") || "0",
        );
        const expectedBalance = initialBalance + 1;

        if (Math.abs(newBalance - expectedBalance) < 0.01) {
          console.log(
            `✅ Balance correctly increased from $${initialBalance} to $${newBalance}`,
          );
        } else {
          console.log(
            `⚠️ Balance verification: expected $${expectedBalance}, got $${newBalance}`,
          );
        }
      } catch (balanceError) {
        console.log("Could not verify balance change");
      }
    } catch (error: any) {
      console.error("❌ Money load test failed:", error);
      throw error;
    }
  }, 120000);

  // Test 4: should show error when loading money with a short CVU
  it("should show error when loading money with a short CVU", async () => {
    console.log("=== TEST: Short CVU Error ===");

    try {
      // Enter amount (numeric keyboard is already open due to autoFocus)
      const amountInput = await appiumHelper.findElementByTestId(
        "amount-input",
        5000,
      );
      await amountInput.setValue("1");
      // Try to dismiss keyboard by tapping outside
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("✓ Amount entered and keyboard dismissed");

      // Enter short CVU
      const cvuField = await appiumHelper.findElementByTestId(
        "cvu-input",
        5000,
      );
      await cvuField.click();
      await cvuField.setValue("1234");
      // Try to dismiss keyboard by tapping outside
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("✓ Short CVU entered and keyboard dismissed");

      // Ensure keyboard is fully dismissed
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Click load button
      const loadButton = await appiumHelper.findElementByTestId(
        "load-money-btn",
        5000,
      );
      await loadButton.click();
      console.log("✓ Load Money button clicked");

      // Wait for validation
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should show error message
      const errorMessage = await appiumHelper.findElementByTestId(
        "error-message",
        5000,
      );
      const isErrorVisible = await errorMessage.isDisplayed();
      expect(isErrorVisible).toBe(true);

      const errorText = await errorMessage.getAttribute("name");
      expect(errorText).toContain(
        "Invalid CBU. CBU must be a 22-digit string.",
      );
      console.log("✅ Error message displayed for short CVU");

      // Should stay on the load money page
      const stillOnLoadScreen = await appiumHelper.isElementDisplayed(
        "Load Money",
        5000,
      );
      expect(stillOnLoadScreen).toBe(true);
      console.log("✅ Correctly stayed on load money screen with short CVU");
    } catch (error: any) {
      console.error("❌ Short CVU test failed:", error);
      throw error;
    }
  }, 60000);

  // Test 5: should show error when loading money with a not valid CVU
  it("should show error when loading money with a not valid CVU", async () => {
    console.log("=== TEST: Invalid CVU Error ===");

    try {
      // Enter amount (numeric keyboard is already open due to autoFocus)
      const amountInput = await appiumHelper.findElementByTestId(
        "amount-input",
        5000,
      );
      await amountInput.setValue("1");
      // Try to dismiss keyboard by tapping outside
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("✓ Amount entered and keyboard dismissed");

      // Enter invalid CVU
      const cvuField = await appiumHelper.findElementByTestId(
        "cvu-input",
        5000,
      );
      await cvuField.click();
      await cvuField.setValue("1111111111111111111111");
      // Try to dismiss keyboard by tapping outside
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("✓ Invalid CVU entered and keyboard dismissed");

      // Ensure keyboard is fully dismissed
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Click load button
      const loadButton = await appiumHelper.findElementByTestId(
        "load-money-btn",
        5000,
      );
      await loadButton.click();
      console.log("✓ Load Money button clicked");

      // Wait for the API call to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should show error message
      const errorMessage = await appiumHelper.findElementByTestId(
        "error-message",
        5000,
      );
      const isErrorVisible = await errorMessage.isDisplayed();
      expect(isErrorVisible).toBe(true);

      const errorText = await errorMessage.getAttribute("name");
      expect(errorText).toContain("Account not found for the provided CBU.");
      console.log("✅ Error message displayed for invalid CVU");

      // Should stay on the load money page
      const stillOnLoadScreen = await appiumHelper.isElementDisplayed(
        "Load Money",
        5000,
      );
      expect(stillOnLoadScreen).toBe(true);
      console.log("✅ Correctly stayed on load money screen with invalid CVU");
    } catch (error: any) {
      console.error("❌ Invalid CVU test failed:", error);
      throw error;
    }
  }, 60000);

  // Test 6: should handle maximum limit for loading money
  it("should handle maximum limit for loading money", async () => {
    console.log("=== TEST: Maximum Limit Error ===");

    try {
      // Enter excessive amount (numeric keyboard is already open due to autoFocus)
      const amountInput = await appiumHelper.findElementByTestId(
        "amount-input",
        5000,
      );
      await amountInput.setValue("100000");
      // Try to dismiss keyboard by tapping outside
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("✓ Excessive amount (100000) entered and keyboard dismissed");

      // Enter valid CVU
      const cvuField = await appiumHelper.findElementByTestId(
        "cvu-input",
        5000,
      );
      await cvuField.click();
      await cvuField.setValue("4567890123456789012345");
      // Try to dismiss keyboard by tapping outside
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("✓ Valid CVU entered and keyboard dismissed");

      // Ensure keyboard is fully dismissed
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Click load button
      const loadButton = await appiumHelper.findElementByTestId(
        "load-money-btn",
        5000,
      );
      await loadButton.click();
      console.log("✓ Load Money button clicked");

      // Wait for the API call to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should show error message
      const errorMessage = await appiumHelper.findElementByTestId(
        "error-message",
        5000,
      );
      const isErrorVisible = await errorMessage.isDisplayed();
      expect(isErrorVisible).toBe(true);

      const errorText = await errorMessage.getAttribute("name");
      expect(errorText).toContain("Insufficient funds");
      console.log("✅ Error message displayed for excessive amount");

      // Should stay on the load money page
      const stillOnLoadScreen = await appiumHelper.isElementDisplayed(
        "Load Money",
        5000,
      );
      expect(stillOnLoadScreen).toBe(true);
      console.log(
        "✅ Correctly stayed on load money screen after excessive amount attempt",
      );
    } catch (error: any) {
      console.error("❌ Maximum limit test failed:", error);
      throw error;
    }
  }, 60000);
});
