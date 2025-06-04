describe("Send Money functionality", () => {
  beforeEach(() => {
    // Login before each test
    cy.visit("/login");
    cy.get('input[placeholder="Email"]').type("tomi.serra@gmail.com");
    cy.get('input[placeholder="Password"]').type("Tomi1234");
    cy.contains("Sign In").click();

    // Wait for home page to load
    cy.url().should("eq", Cypress.config().baseUrl + "/");

    // Navigate to send money page
    cy.contains("Send").click();
    cy.url().should("include", "/send");
  });

  it("should disable send button when amount is not entered", () => {
    // Check that the Send Money button is disabled initially
    cy.get('[data-testid="send-money-btn"]').should(
      "have.attr",
      "aria-disabled",
      "true"
    );

    // Enter only recipient email
    cy.get('input[placeholder="Recipient email"]').type("liz@gmail.com");

    // Button should still be disabled
    cy.get('[data-testid="send-money-btn"]').should(
      "have.attr",
      "aria-disabled",
      "true"
    );
  });

  it("should disable send button when recipient is not entered", () => {
    // Enter only amount
    cy.get("input").first().type("1");

    // Button should still be disabled
    cy.get('[data-testid="send-money-btn"]').should(
      "have.attr",
      "aria-disabled",
      "true"
    );
  });

  it("should successfully send money to a valid recipient", () => {
    // Intercept the transfer API call
    cy.intercept("POST", "**/transfer", {
      statusCode: 200,
      body: { message: "Transfer successful" },
    }).as("transferRequest");

    // Enter amount
    cy.get("input").first().type("1");

    // Enter recipient email
    cy.get('input[placeholder="Recipient email"]').type("liz@gmail.com");

    // Click send button
    cy.get('[data-testid="send-money-btn"]').click();

    // Wait for the API call to complete
    cy.wait("@transferRequest");

    // Should redirect to home page
    cy.url().should("eq", Cypress.config().baseUrl + "/");

    // Verify the transaction appears in the list
    cy.contains("$1 was sent to liz@gmail.com").should("be.visible");
  });

  it("should show error when sending money to invalid recipient", () => {
    // Intercept the transfer API call with an error
    cy.intercept("POST", "**/transfer", {
      statusCode: 404,
      body: { message: "User not found" },
    }).as("transferError");

    // Enter amount
    cy.get("input").first().type("1");

    // Enter invalid recipient email
    cy.get('input[placeholder="Recipient email"]').type(
      "nonexistent@example.com"
    );

    // Click send button
    cy.get('[data-testid="send-money-btn"]').click();

    // Wait for the API call to complete
    cy.wait("@transferError");

    // Should show error message
    cy.contains("User not found").should("be.visible");

    // Should stay on the send money page
    cy.url().should("include", "/send");
  });
});
