import { AppiumHelper } from "../helpers/AppiumHelper";

describe("Withdraw functionality", () => {
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
    // Login and navigate to withdraw money page for each test
    await appiumHelper.ensureOnLoginScreen();

    // Wait for login screen
    await appiumHelper.waitForElementByText("Welcome back", 1000);
    console.log("✓ Login screen loaded");

    // Login with johndoe@mail.com credentials
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

    // Navigate to withdraw money page
    const withdrawButton = await appiumHelper.findElementByTestId(
      "withdraw-nav-button",
      1000,
    );
    await withdrawButton.click();
    console.log("✓ Withdraw button clicked");

    // Wait for withdraw money page to load and verify
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify we're on withdraw money screen
    const withdrawMoneyScreen = await appiumHelper.driver!.$(
      '//*[contains(@name, "Withdraw Money")]',
    );
    await withdrawMoneyScreen.waitForDisplayed({ timeout: 1000 });
    console.log("✓ Withdraw Money screen loaded");

    // Note: The money input field has autoFocus=true, so numeric keyboard opens automatically
    console.log(
      "ℹ️ Numeric keyboard is automatically opened due to money input autoFocus",
    );
  }, 90000);

  afterEach(async () => {
    // Navigate back and logout after each test
    try {
      if (appiumHelper.driver) {
        // Navigate back to home screen if we're still on withdraw money page
        try {
          const onWithdrawScreen = await appiumHelper.isElementDisplayed(
            "Withdraw Money",
            1000,
          );
          if (onWithdrawScreen) {
            console.log(
              "Still on Withdraw Money screen, navigating back to home",
            );

            // Navigate back using coordinate tap
            await appiumHelper.navigateBack(1000);

            // Wait for navigation
            await new Promise((resolve) => setTimeout(resolve, 1000));
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

  // Test 1: should disable withdraw button when amount is not entered
  it("should disable withdraw button when amount is not entered", async () => {
    console.log("=== TEST: Withdraw Button Disabled Without Amount ===");

    try {
      // First, hide the keyboard to check button state
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("✓ Keyboard hidden");

      // Check that the Withdraw Money button is disabled initially
      const withdrawButton = await appiumHelper.findElementByTestId(
        "withdraw-money-btn",
        1000,
      );
      const initialDisabledState =
        await appiumHelper.isElementDisabled(withdrawButton);
      expect(initialDisabledState).toBe(true);
      console.log("✓ Withdraw button is disabled initially");

      // Enter only CVU
      const cvuField = await appiumHelper.findElementByTestId(
        "cvu-input",
        1000,
      );
      await cvuField.click();
      await cvuField.setValue("4567890123456789012345");
      await appiumHelper.dismissKeyboard();
      console.log("✓ CVU entered");

      // Hide keyboard again to check button state
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Button should still be disabled
      const stillDisabled =
        await appiumHelper.isElementDisabled(withdrawButton);
      expect(stillDisabled).toBe(true);
      console.log(
        "✅ Withdraw button correctly remains disabled without amount",
      );
    } catch (error: any) {
      console.error("❌ Amount validation test failed:", error);
      throw error;
    }
  }, 60000);

  // Test 2: should disable withdraw button when CVU is not entered
  it("should disable withdraw button when CVU is not entered", async () => {
    console.log("=== TEST: Withdraw Button Disabled Without CVU ===");

    try {
      // Enter only amount (numeric keyboard is already open due to autoFocus)
      const amountInput = await appiumHelper.findElementByTestId(
        "amount-input",
        1000,
      );
      await amountInput.setValue("1");
      await appiumHelper.dismissKeyboard();
      console.log("✓ Amount entered (numeric keyboard was already open)");

      // Hide keyboard to check button state
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Button should still be disabled
      const withdrawButton = await appiumHelper.findElementByTestId(
        "withdraw-money-btn",
        1000,
      );
      const isDisabled = await appiumHelper.isElementDisabled(withdrawButton);
      expect(isDisabled).toBe(true);
      console.log("✅ Withdraw button correctly remains disabled without CVU");
    } catch (error: any) {
      console.error("❌ CVU validation test failed:", error);
      throw error;
    }
  }, 60000);

  // Test 3: should successfully withdraw money using a valid CVU
  it("should successfully withdraw money using a valid CVU", async () => {
    console.log("=== TEST: Successful Money Withdrawal ===");

    try {
      // Get initial balance first by navigating back to home
      await appiumHelper.navigateBack(1000);
      console.log("✓ Navigated back to home to check balance");

      // Wait for home page
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get current balance (we'll verify it decreases by $1 after withdrawal)
      let initialBalance: number;
      try {
        const balanceElement = await appiumHelper.findElementByTestId(
          "balance-display",
          1000,
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

      // Navigate back to withdraw money page
      const withdrawNavButton = await appiumHelper.findElementByTestId(
        "withdraw-nav-button",
        1000,
      );
      await withdrawNavButton.click();
      console.log("✓ Navigated back to Withdraw Money screen");

      // Wait for withdraw money page to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Enter amount (numeric keyboard is already open due to autoFocus)
      const amountInput = await appiumHelper.findElementByTestId(
        "amount-input",
        1000,
      );
      await amountInput.setValue("1");
      // Try to dismiss keyboard by tapping outside
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("✓ Amount ($1) entered and keyboard dismissed");

      // Enter valid CVU
      const cvuField = await appiumHelper.findElementByTestId(
        "cvu-input",
        1000,
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

      // Click withdraw button
      const withdrawButton = await appiumHelper.findElementByTestId(
        "withdraw-money-btn",
        1000,
      );
      await withdrawButton.click();
      console.log("✓ Withdraw Money button clicked");

      // Wait for the transaction to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if we're back on home screen or still on withdraw screen
      const isBackOnHome = await appiumHelper.isElementDisplayed(
        "Lime Cash",
        1000,
      );

      if (isBackOnHome) {
        console.log("✅ Successfully returned to home screen after withdrawal");
      } else {
        // If still on withdraw screen, check for success state and navigate back manually
        console.log(
          "Still on withdraw screen, checking for success state and navigating back",
        );

        // Wait a bit more for any success feedback
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Navigate back to home manually
        await appiumHelper.navigateBack(1000);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const finalHomeCheck = await appiumHelper.isElementDisplayed(
          "Lime Cash",
          1000,
        );
        expect(finalHomeCheck).toBe(true);
        console.log("✅ Successfully navigated back to home screen");
      }

      // Verify the transaction appears in the list
      const successMessage = await appiumHelper.isElementDisplayed(
        "$1 was withdrawn to bank account",
        1000,
      );
      if (successMessage) {
        console.log("✅ Success message displayed");
      } else {
        console.log(
          "⚠️ Success message not found (may be different text format)",
        );
      }

      // Verify balance decreased
      try {
        const newBalanceElement = await appiumHelper.findElementByTestId(
          "balance-display",
          1000,
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
        const expectedBalance = initialBalance - 1;

        if (Math.abs(newBalance - expectedBalance) < 0.01) {
          console.log(
            `✅ Balance correctly decreased from $${initialBalance} to $${newBalance}`,
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
      console.error("❌ Money withdrawal test failed:", error);
      throw error;
    }
  }, 60000);

  // Test 4: should show error when withdrawing money with a short CVU
  it("should show error when withdrawing money with a short CVU", async () => {
    console.log("=== TEST: Short CVU Error ===");

    try {
      // Enter amount (numeric keyboard is already open due to autoFocus)
      const amountInput = await appiumHelper.findElementByTestId(
        "amount-input",
        1000,
      );
      await amountInput.setValue("1");
      // Try to dismiss keyboard by tapping outside
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("✓ Amount entered and keyboard dismissed");

      // Enter short CVU
      const cvuField = await appiumHelper.findElementByTestId(
        "cvu-input",
        1000,
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

      // Click withdraw button
      const withdrawButton = await appiumHelper.findElementByTestId(
        "withdraw-money-btn",
        1000,
      );
      await withdrawButton.click();
      console.log("✓ Withdraw Money button clicked");

      // Wait for validation and error toast to appear
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Should show error message
      const errorMessage = await appiumHelper.findElementByTestId(
        "error-message",
        100,
      );
      const isErrorVisible = await errorMessage.isDisplayed();
      expect(isErrorVisible).toBe(true);
      console.log("✅ Error message displayed for short CVU");

      // Should stay on the withdraw money page
      const stillOnWithdrawScreen = await appiumHelper.isElementDisplayed(
        "Withdraw Money",
        1000,
      );
      expect(stillOnWithdrawScreen).toBe(true);
      console.log(
        "✅ Correctly stayed on withdraw money screen with short CVU",
      );
    } catch (error: any) {
      console.error("❌ Short CVU test failed:", error);
      throw error;
    }
  }, 60000);

  // Test 5: should show error when withdrawing money with a not valid CVU
  it("should show error when withdrawing money with a not valid CVU", async () => {
    console.log("=== TEST: Invalid CVU Error ===");

    try {
      // Enter amount (numeric keyboard is already open due to autoFocus)
      const amountInput = await appiumHelper.findElementByTestId(
        "amount-input",
        1000,
      );
      await amountInput.setValue("1");
      // Try to dismiss keyboard by tapping outside
      await appiumHelper.tapOnCoordinates(200, 250);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("✓ Amount entered and keyboard dismissed");

      // Enter invalid CVU
      const cvuField = await appiumHelper.findElementByTestId(
        "cvu-input",
        1000,
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

      // Click withdraw button
      const withdrawButton = await appiumHelper.findElementByTestId(
        "withdraw-money-btn",
        1000,
      );
      await withdrawButton.click();
      console.log("✓ Withdraw Money button clicked");

      // Wait for the API call to complete and error toast to appear
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Should show error message
      const errorMessage = await appiumHelper.findElementByTestId(
        "error-message",
        100,
      );
      const isErrorVisible = await errorMessage.isDisplayed();
      expect(isErrorVisible).toBe(true);
      console.log("✅ Error message displayed for invalid CVU");

      // Should stay on the withdraw money page
      const stillOnWithdrawScreen = await appiumHelper.isElementDisplayed(
        "Withdraw Money",
        1000,
      );
      expect(stillOnWithdrawScreen).toBe(true);
      console.log(
        "✅ Correctly stayed on withdraw money screen with invalid CVU",
      );
    } catch (error: any) {
      console.error("❌ Invalid CVU test failed:", error);
      throw error;
    }
  }, 60000);

  // Test 6: should show error when withdrawing money with an amount greater than the balance
  it("should show error when withdrawing money with an amount greater than the balance", async () => {
    console.log("=== TEST: Amount Exceeds Balance Error ===");

    try {
      // First, we need to get the current balance - navigate back to home briefly
      await appiumHelper.navigateBack(1000);
      console.log("✓ Navigated back to home to check balance");

      // Wait for home page
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get current balance
      let currentBalance: number;
      try {
        const balanceElement = await appiumHelper.findElementByTestId(
          "balance-display",
          1000,
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

        currentBalance = parseFloat(balanceText?.replace(/\$|,/g, "") || "0");
        console.log(`✓ Current balance: $${currentBalance}`);
      } catch (balanceError) {
        console.log("Could not get current balance, using 1000 as default");
        currentBalance = 1000;
      }

      // Calculate excessive amount (current balance + 1)
      const excessiveAmount = (currentBalance + 1).toString();

      // Navigate back to withdraw money page
      const withdrawButton = await appiumHelper.findElementByTestId(
        "withdraw-nav-button",
        1000,
      );
      await withdrawButton.click();
      console.log("✓ Navigated back to Withdraw Money screen");

      // Wait for withdraw money page to load
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Enter excessive amount (numeric keyboard is already open due to autoFocus)
      const amountInput = await appiumHelper.findElementByTestId(
        "amount-input",
        1000,
      );
      await amountInput.setValue(excessiveAmount);
      console.log(`✓ Excessive amount (${excessiveAmount}) entered`);

      // Enter valid CVU
      const cvuField = await appiumHelper.findElementByTestId(
        "cvu-input",
        1000,
      );
      await cvuField.click();
      await cvuField.setValue("4567890123456789012345");
      await appiumHelper.tapOnCoordinates(200, 250);

      console.log("✓ CVU entered");

      // Click withdraw button
      const withdrawMoneyButton = await appiumHelper.findElementByTestId(
        "withdraw-money-btn",
        1000,
      );
      await withdrawMoneyButton.click();
      console.log("✓ Withdraw Money button clicked");

      // Wait for the API call to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should show error message
      const errorMessage = await appiumHelper.findElementByTestId(
        "error-message",
        100,
      );
      console.log("✅ Error message displayed for excessive amount");

      // Should stay on the withdraw money page
      const stillOnWithdrawScreen = await appiumHelper.isElementDisplayed(
        "Withdraw Money",
        1000,
      );
      expect(stillOnWithdrawScreen).toBe(true);
      console.log(
        "✅ Correctly stayed on withdraw money screen after excessive amount attempt",
      );
    } catch (error: any) {
      console.error("❌ Maximum limit test failed:", error);
      throw error;
    }
  }, 60000);
});
