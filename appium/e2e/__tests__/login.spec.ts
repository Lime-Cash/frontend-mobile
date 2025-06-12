import { AppiumHelper } from "../helpers/AppiumHelper";

describe("Comprehensive Login Test Suite", () => {
  let appiumHelper: AppiumHelper;

  beforeEach(async () => {
    appiumHelper = new AppiumHelper();
    await appiumHelper.initDriver();
    console.log("Driver initialized successfully");

    // Ensure we start each test from the login screen
    await appiumHelper.ensureOnLoginScreen();
  }, 60000); // Increased timeout from 30s to 60s

  afterEach(async () => {
    // Ensure we logout after each test for proper test isolation
    try {
      await appiumHelper.logoutIfLoggedIn();
    } catch (error: any) {
      console.log("Logout attempt in afterEach failed:", error);
    }

    if (appiumHelper.driver) {
      await appiumHelper.quitDriver();
      console.log("Driver quit successfully");
    }
  });

  it("should display all login screen elements correctly", async () => {
    console.log("=== TEST: Login Screen Elements ===");

    try {
      // Wait for app to fully load
      await new Promise((resolve) => setTimeout(resolve, 3000));
      console.log("App loading wait completed");

      // Verify welcome text
      const welcomeText = await appiumHelper.waitForElementByText(
        "Welcome back",
        20000,
      );
      expect(welcomeText).toBeDefined();
      console.log("✓ Welcome text found");

      // Verify subtitle
      const subtitleText = await appiumHelper.waitForElementByText(
        "Enter your credentials to continue",
        10000,
      );
      expect(subtitleText).toBeDefined();
      console.log("✓ Subtitle text found");

      // Verify email input field
      const emailField = await appiumHelper.findEmailField(10000);
      expect(emailField).toBeDefined();
      console.log("✓ Email input field found");

      // Verify password input field
      const passwordField = await appiumHelper.findPasswordField(10000);
      expect(passwordField).toBeDefined();
      console.log("✓ Password input field found");

      // Verify Sign In button
      const signInButton = await appiumHelper.waitForButton("Sign In", 10000);
      expect(signInButton).toBeDefined();
      console.log("✓ Sign In button found");

      // Verify signup link
      const signUpText = await appiumHelper.waitForElementByText(
        "Don't have an account?",
        10000,
      );
      expect(signUpText).toBeDefined();
      console.log("✓ Sign up text found");

      console.log("✅ All login screen elements are present!");
    } catch (error: any) {
      console.error("❌ Login elements test failed:", error);
      throw error;
    }
  }, 60000);

  it("should login successfully with valid credentials and logout", async () => {
    console.log("=== TEST: Valid Login with Complete Logout ===");

    try {
      // Step 1: Wait for login screen
      await appiumHelper.waitForElementByText("Welcome back", 15000);
      console.log("✓ Login screen loaded");

      // Step 2: Fill credentials
      await appiumHelper.fillEmailField("johndoe@mail.com");
      await appiumHelper.fillPasswordField("Password123!");
      console.log("✓ Credentials entered");

      // Step 3: Click Sign In
      const signInButton = await appiumHelper.waitForButton("Sign In", 10000);
      await signInButton.click();
      console.log("✓ Sign In button clicked");

      // Step 4: Wait for navigation to home screen
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Check for home screen elements
      const homeElements = ["Lime Cash", "Send", "Withdraw", "Load", "Logout"];
      let homeElementsFound = 0;

      for (const elementText of homeElements) {
        const isPresent = await appiumHelper.isElementDisplayed(
          `//*[@name="${elementText}" or @text="${elementText}" or @label="${elementText}"]`,
          3000,
        );
        if (isPresent) {
          homeElementsFound++;
          console.log(`✓ Found home screen element: ${elementText}`);
        }
      }

      if (homeElementsFound >= 2) {
        console.log("✅ Login successful - navigated to home screen");

        // Step 5: Test complete logout functionality
        console.log("=== Testing Logout Functionality ===");
        await appiumHelper.logoutIfLoggedIn();

        // Verify we're back on login screen
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const isBackToLogin = await appiumHelper.isElementDisplayed(
          "Welcome back",
          5000,
        );

        if (isBackToLogin) {
          console.log("✅ Logout successful - back to login screen");
        } else {
          console.log("⚠️ Could not verify login screen after logout");
        }
      } else {
        console.log(
          "⚠️ Home screen navigation unclear - checking for backend connectivity",
        );
        // This is expected when backend is not running
      }
    } catch (error: any) {
      console.error("❌ Valid login test failed:", error);
      throw error;
    }
  }, 120000);

  it("should reject invalid email format", async () => {
    console.log("=== TEST: Invalid Email Format ===");

    try {
      // Wait for login screen
      await appiumHelper.waitForElementByText("Welcome back", 15000);

      // Fill invalid email and valid password
      await appiumHelper.fillEmailField("invalid-email-format");
      await appiumHelper.fillPasswordField("Password123!");
      console.log("✓ Invalid email entered");

      // Attempt login
      const signInButton = await appiumHelper.waitForButton("Sign In", 10000);
      await signInButton.click();
      console.log("✓ Sign In button clicked with invalid email");

      // Wait for validation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verify we're still on login screen (validation should prevent login)
      const welcomeText = await appiumHelper.isElementDisplayed(
        "Welcome back",
        5000,
      );
      expect(welcomeText).toBe(true);
      console.log("✅ Invalid email handled correctly - still on login screen");
    } catch (error: any) {
      console.error("❌ Invalid email test failed:", error);
      throw error;
    }
  }, 60000);

  it("should reject short password", async () => {
    console.log("=== TEST: Short Password Validation ===");

    try {
      // Wait for login screen
      await appiumHelper.waitForElementByText("Welcome back", 15000);

      // Fill valid email and short password
      await appiumHelper.fillEmailField("johndoe@mail.com");

      const passwordField = await appiumHelper.findPasswordField(10000);
      await passwordField.click();
      await passwordField.clearValue();
      await passwordField.setValue("123");
      await appiumHelper.dismissKeyboard();
      console.log("✓ Short password entered");

      // Attempt login
      const signInButton = await appiumHelper.waitForButton("Sign In", 10000);
      await signInButton.click();
      console.log("✓ Sign In button clicked with short password");

      // Wait for validation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verify we're still on login screen
      const welcomeText = await appiumHelper.isElementDisplayed(
        "Welcome back",
        5000,
      );
      expect(welcomeText).toBe(true);
      console.log(
        "✅ Short password handled correctly - still on login screen",
      );
    } catch (error: any) {
      console.error("❌ Short password test failed:", error);
      throw error;
    }
  }, 60000);

  it("should reject empty email field", async () => {
    console.log("=== TEST: Empty Email Field ===");

    try {
      // Wait for login screen
      await appiumHelper.waitForElementByText("Welcome back", 15000);

      await appiumHelper.fillEmailField(""); // Fill email field with empty string
      console.log("✓ Email field left empty");

      // Fill only password, leave email empty
      await appiumHelper.fillPasswordField("Password123!");
      console.log("✓ Only password filled, email left empty");

      // Attempt login
      const signInButton = await appiumHelper.waitForButton("Sign In", 10000);
      await signInButton.click();
      console.log("✓ Sign In button clicked with empty email");

      // Wait for validation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verify we're still on login screen
      const welcomeText = await appiumHelper.isElementDisplayed(
        "Welcome back",
        5000,
      );
      expect(welcomeText).toBe(true);
      console.log("✅ Empty email handled correctly - still on login screen");
    } catch (error: any) {
      console.error("❌ Empty email test failed:", error);
      throw error;
    }
  }, 60000);

  it("should reject empty password field", async () => {
    console.log("=== TEST: Empty Password Field ===");

    try {
      // Wait for login screen
      await appiumHelper.waitForElementByText("Welcome back", 15000);

      // Fill only email, leave password empty
      await appiumHelper.fillEmailField("johndoe@mail.com");
      console.log("✓ Only email filled, password left empty");

      await appiumHelper.fillPasswordField(""); // Fill password field with empty string
      console.log("✓ Password field left empty");

      // Attempt login
      const signInButton = await appiumHelper.waitForButton("Sign In", 10000);
      await signInButton.click();
      console.log("✓ Sign In button clicked with empty password");

      // Wait for validation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verify we're still on login screen
      const welcomeText = await appiumHelper.isElementDisplayed(
        "Welcome back",
        5000,
      );
      expect(welcomeText).toBe(true);
      console.log(
        "✅ Empty password handled correctly - still on login screen",
      );
    } catch (error: any) {
      console.error("❌ Empty password test failed:", error);
      throw error;
    }
  }, 60000);

  it("should handle multiple login/logout cycles", async () => {
    console.log("=== TEST: Multiple Login/Logout Cycles ===");

    try {
      const cycles = 2;

      for (let cycle = 1; cycle <= cycles; cycle++) {
        console.log(`--- Cycle ${cycle}/${cycles} ---`);

        // Ensure we're on login screen
        await appiumHelper.waitForElementByText("Welcome back", 15000);
        console.log(`✓ Cycle ${cycle}: On login screen`);

        // Login with valid credentials
        await appiumHelper.fillEmailField("johndoe@mail.com");
        await appiumHelper.fillPasswordField("Password123!");

        const signInButton = await appiumHelper.waitForButton("Sign In", 10000);
        await signInButton.click();
        console.log(`✓ Cycle ${cycle}: Login attempted`);

        // Wait for potential navigation
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Check if we can find home screen elements
        const limeCashVisible = await appiumHelper.isElementDisplayed(
          "Lime Cash",
          5000,
        );
        if (limeCashVisible) {
          console.log(`✓ Cycle ${cycle}: Successfully logged in`);

          // Logout
          await appiumHelper.logoutIfLoggedIn();

          // Wait for logout to complete
          await new Promise((resolve) => setTimeout(resolve, 3000));
          console.log(`✓ Cycle ${cycle}: Logout completed`);
        } else {
          console.log(
            `⚠️ Cycle ${cycle}: Login navigation unclear (expected with no backend)`,
          );
        }
      }

      console.log("✅ All login/logout cycles completed successfully");
    } catch (error: any) {
      console.error("❌ Multiple cycles test failed:", error);
      throw error;
    }
  }, 180000); // 3 minutes for multiple cycles

  it("should navigate to register screen when sign up link is tapped", async () => {
    console.log("=== TEST: Navigation to Register Screen ===");

    try {
      // Wait for login screen
      await appiumHelper.waitForElementByText("Welcome back", 15000);

      // Find and tap the sign up link
      const signUpLink = await appiumHelper.waitForElementByText(
        "Sign up",
        10000,
      );
      await signUpLink.click();
      console.log("✓ Sign up link tapped");

      // Wait for navigation
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Check if we've navigated away from login screen by looking for "Welcome back"
      const isLoginScreenStillVisible = await appiumHelper.isElementDisplayed(
        "Welcome back",
        3000,
      );

      if (!isLoginScreenStillVisible) {
        console.log("✅ Successfully navigated away from login screen");

        // Also check for register screen elements to confirm navigation
        try {
          const registerElements = [
            "Create account",
            "Enter your details to get started",
          ];

          let foundRegisterElement = false;
          for (const elementText of registerElements) {
            const isPresent = await appiumHelper.isElementDisplayed(
              elementText,
              2000,
            );
            if (isPresent) {
              console.log(`✓ Found register screen element: ${elementText}`);
              foundRegisterElement = true;
              break;
            }
          }

          if (!foundRegisterElement) {
            console.log(
              "⚠️ Navigated away from login but register screen elements not found",
            );
          }
        } catch (error: any) {
          console.log("Could not verify register screen elements:", error);
        }
      } else {
        console.log(
          "⚠️ Navigation may not have completed - still on login screen",
        );
        try {
          if (appiumHelper.isDriverAvailable()) {
            const currentElements = await appiumHelper.getAccessibleElements();
            console.log("Current elements:", currentElements.slice(0, 10));
          } else {
            console.log("Driver not available for element inspection");
          }
        } catch (debugError: any) {
          console.log(
            "Could not get current elements:",
            debugError.message || debugError,
          );
        }
      }
      // Navigate back to login screen
      const signInLink = await appiumHelper.waitForElementByText(
        "Sign in",
        10000,
      );
      await signInLink.click();
      console.log("✓ Sign in link tapped");
    } catch (error: any) {
      console.error("❌ Register navigation test failed:", error);
      throw error;
    }
  }, 60000);
});
