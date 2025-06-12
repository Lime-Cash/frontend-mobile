describe("Login functionality", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("should successfully login with valid credentials", () => {
    cy.get('[data-testid="email-input"]').type("tomi.serra@gmail.com");
    cy.get('[data-testid="password-input"]').type("Tomi1234$");

    cy.get('[data-testid="signin-button"]').click();

    cy.url().should("eq", Cypress.config().baseUrl + "/");
  });

  it("should show error message with invalid email", () => {
    cy.get('[data-testid="email-input"]').type("fail@fail.com");
    cy.get('[data-testid="password-input"]').type("WrongPassword123");

    cy.get('[data-testid="signin-button"]').click();

    cy.get('[data-testid="error-message"]').should("be.visible");
    cy.get('[data-testid="error-message"]').should(
      "contain",
      "Invalid email or password",
    );

    cy.url().should("include", "/login");
  });

  it("should show error message with invalid password", () => {
    cy.get('[data-testid="email-input"]').type("tomi.serra@gmail.com");
    cy.get('[data-testid="password-input"]').type("WrongPassword123");

    cy.get('[data-testid="signin-button"]').click();

    cy.get('[data-testid="error-message"]').should("be.visible");
    cy.get('[data-testid="error-message"]').should(
      "contain",
      "Invalid email or password",
    );

    cy.url().should("include", "/login");
  });
});
