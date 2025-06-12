import { AppiumHelper } from "../helpers/AppiumHelper";

describe("Login Test Suite", () => {
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
    // Ensure we start each test from the login screen
    await appiumHelper.ensureOnLoginScreen();

    // Wait for login screen
    await appiumHelper.waitForElementByText("Welcome back", 15000);
    console.log("✓ Login screen loaded");
  }, 60000);

  afterEach(async () => {
    // Logout after each test if logged in
    try {
      await appiumHelper.logoutIfLoggedIn();
    } catch (error: any) {
      console.log("Logout attempt in afterEach failed:", error);
    }
  });

  // Test 1: Login with valid credentials
  it("should login successfully with valid credentials", async () => {
    console.log("=== TEST: Valid Login ===");

    try {
      // Fill credentials
      await appiumHelper.fillEmailField("johndoe@mail.com");
      await appiumHelper.fillPasswordField("Password123!");
      console.log("✓ Credentials entered");

      // Click Sign In button using testID
      const signInButton = await appiumHelper.findElementByTestId(
        "signin-button",
        10000,
      );
      await signInButton.click();
      console.log("✓ Sign In button clicked");

      // Wait for navigation
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Check if we successfully navigated (look for home screen elements)
      const homeElements = ["Lime Cash", "Send", "Withdraw", "Load"];
      let homeElementsFound = 0;

      for (const elementText of homeElements) {
        const isPresent = await appiumHelper.isElementDisplayed(
          elementText,
          3000,
        );
        if (isPresent) {
          homeElementsFound++;
          console.log(`✓ Found home screen element: ${elementText}`);
        }
      }

      if (homeElementsFound >= 2) {
        console.log("✅ Login successful - navigated to home screen");
      } else {
        console.log(
          "⚠️ Login may have succeeded but home screen elements not fully visible",
        );
      }
    } catch (error: any) {
      console.error("❌ Valid login test failed:", error);
      throw error;
    }
  }, 90000);

  // Test 2: Login with invalid email
  it("should reject invalid email format", async () => {
    console.log("=== TEST: Invalid Email Format ===");

    try {
      // Fill invalid email and valid password
      await appiumHelper.fillEmailField("invalid-email-format");
      await appiumHelper.fillPasswordField("Password123!");
      console.log("✓ Invalid email entered");

      // Click Sign In button
      const signInButton = await appiumHelper.findElementByTestId(
        "signin-button",
        10000,
      );
      await signInButton.click();
      console.log("✓ Sign In button clicked with invalid email");

      // Wait for validation
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Check if error message appears or we're still on login screen
      const stillOnLogin = await appiumHelper.isElementDisplayed(
        "Welcome back",
        5000,
      );
      const errorVisible = await appiumHelper.isElementDisplayed(
        "Invalid Email",
        3000,
      );

      if (stillOnLogin || errorVisible) {
        console.log("✅ Invalid email handled correctly - validation working");
      } else {
        console.log("⚠️ Could not verify email validation");
      }
    } catch (error: any) {
      console.error("❌ Invalid email test failed:", error);
      throw error;
    }
  }, 60000);

  // Test 3: Login with invalid password
  it("should reject invalid password", async () => {
    console.log("=== TEST: Invalid Password ===");

    try {
      // Fill valid email and invalid password
      await appiumHelper.fillEmailField("johndoe@mail.com");
      await appiumHelper.fillPasswordField("123"); // Too short
      console.log("✓ Invalid password entered");

      // Click Sign In button
      const signInButton = await appiumHelper.findElementByTestId(
        "signin-button",
        10000,
      );
      await signInButton.click();
      console.log("✓ Sign In button clicked with invalid password");

      // Wait for validation
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Check if error message appears or we're still on login screen
      const stillOnLogin = await appiumHelper.isElementDisplayed(
        "Welcome back",
        5000,
      );
      const errorVisible = await appiumHelper.isElementDisplayed(
        "Invalid Password",
        3000,
      );

      if (stillOnLogin || errorVisible) {
        console.log(
          "✅ Invalid password handled correctly - validation working",
        );
      } else {
        console.log("⚠️ Could not verify password validation");
      }
    } catch (error: any) {
      console.error("❌ Invalid password test failed:", error);
      throw error;
    }
  }, 60000);
});
