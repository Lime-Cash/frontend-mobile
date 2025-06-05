import { AppiumHelper } from "../helpers/AppiumHelper";

describe("App Launch Test", () => {
  let appiumHelper: AppiumHelper;

  beforeEach(async () => {
    appiumHelper = new AppiumHelper();
    await appiumHelper.initDriver();
    console.log("Driver initialized successfully");
  });

  afterEach(async () => {
    if (appiumHelper.driver) {
      await appiumHelper.quitDriver();
      console.log("Driver quit successfully");
    }
  });

  it("should launch the app successfully", async () => {
    // Wait for the app to load (adjust selector based on your app's structure)
    // This is a generic test that checks if the app launches

    // Add a basic assertion to ensure the driver is working
    expect(appiumHelper.driver).toBeDefined();
    expect(appiumHelper.driver !== null).toBe(true);

    // You can add more specific tests here based on your app's UI
    // For example:
    // const welcomeText = await appiumHelper.isElementDisplayed("~welcome-message");
    // expect(welcomeText).toBe(true);

    console.log("App launched successfully!");
  });
});
