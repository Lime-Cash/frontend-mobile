describe("Login functionality", () => {
  beforeEach(() => {
    // Visit the login page before each test
    cy.visit("/login");
  });

  it("should successfully login with valid credentials", () => {
    // Type valid email and password
    cy.get('input[placeholder="Email"]').type("tomi.serra@gmail.com");
    cy.get('input[placeholder="Password"]').type("Tomi1234$");

    // Click the login button
    cy.contains("Sign In").click();

    // Assert that we are redirected to the home page
    cy.url().should("eq", Cypress.config().baseUrl + "/");

    // Additional assertions could be added here to verify the logged-in state
    // For example, checking if specific elements of the logged-in UI are visible
  });

  it("should show error message with invalid credentials", () => {
    // Type invalid email and password
    cy.get('input[placeholder="Email"]').type("fail@fail.com");
    cy.get('input[placeholder="Password"]').type("WrongPassword123");

    // Intercept the API call to mock the error response
    cy.intercept("POST", "**/login", {
      statusCode: 401,
      body: { error: "Authentication failed" },
    }).as("loginRequest");

    // Click the login button
    cy.contains("Sign In").click();

    // Wait for the API call to complete
    cy.wait("@loginRequest");

    // Verify error message is displayed
    cy.contains("Authentication failed").should("be.visible");

    // Ensure we're still on the login page
    cy.url().should("include", "/login");
  });

  it("should validate email format before submission", () => {
    // Try to login with invalid email format
    cy.get('input[placeholder="Email"]').type("invalid-email");
    cy.get('input[placeholder="Password"]').type("SomePassword123");

    // Click the login button
    cy.contains("Sign In").click();

    // Verify validation error message is shown
    cy.contains("Invalid Email").should("be.visible");

    // Ensure we're still on the login page
    cy.url().should("include", "/login");
  });

  it("should validate password length before submission", () => {
    // Try to login with a too short password
    cy.get('input[placeholder="Email"]').type("valid@email.com");
    cy.get('input[placeholder="Password"]').type("short");

    // Click the login button
    cy.contains("Sign In").click();

    // Verify validation error message is shown
    cy.contains("Invalid Password").should("be.visible");

    // Ensure we're still on the login page
    cy.url().should("include", "/login");
  });
});
