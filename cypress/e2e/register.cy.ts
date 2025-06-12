describe("Register functionality", () => {
  beforeEach(() => {
    cy.visit("/register");
  });

  it("should validate password requirements", () => {
    cy.get('[data-testid="name-input"]').type("Test User");
    cy.get('[data-testid="email-input"]').type("test@example.com");

    cy.get('[data-testid="password-input"]').type("password");
    cy.get('[data-testid="confirm-password-input"]').type("password");
    cy.get('[data-testid="signup-button"]').click();
    cy.url().should("include", "/register");

    cy.get('[data-testid="password-input"]').clear();
    cy.get('[data-testid="confirm-password-input"]').clear();

    cy.get('[data-testid="password-input"]').type("Password");
    cy.get('[data-testid="confirm-password-input"]').type("Password");
    cy.get('[data-testid="signup-button"]').click();
    cy.url().should("include", "/register");

    cy.get('[data-testid="password-input"]').clear();
    cy.get('[data-testid="confirm-password-input"]').clear();

    cy.get('[data-testid="password-input"]').type("Password1");
    cy.get('[data-testid="confirm-password-input"]').type("Password1");
    cy.get('[data-testid="signup-button"]').click();
    cy.url().should("include", "/register");

    cy.get('[data-testid="password-input"]').clear();
    cy.get('[data-testid="confirm-password-input"]').clear();

    cy.get('[data-testid="password-input"]').type("password1$");
    cy.get('[data-testid="confirm-password-input"]').type("password1$");
    cy.get('[data-testid="signup-button"]').click();
    cy.url().should("include", "/register");

    cy.get('[data-testid="password-input"]').clear();
    cy.get('[data-testid="confirm-password-input"]').clear();

    cy.get('[data-testid="password-input"]').type("password$");
    cy.get('[data-testid="confirm-password-input"]').type("password$");
    cy.get('[data-testid="signup-button"]').click();
    cy.url().should("include", "/register");

    cy.get('[data-testid="password-input"]').clear();
    cy.get('[data-testid="confirm-password-input"]').clear();

    cy.get('[data-testid="password-input"]').type("PASSWORD1$");
    cy.get('[data-testid="confirm-password-input"]').type("PASSWORD1$");
    cy.get('[data-testid="signup-button"]').click();
    cy.url().should("include", "/register");

    cy.get('[data-testid="password-input"]').clear();
    cy.get('[data-testid="confirm-password-input"]').clear();

    cy.get('[data-testid="password-input"]').type("Pa1$");
    cy.get('[data-testid="confirm-password-input"]').type("Pa1$");
    cy.get('[data-testid="signup-button"]').click();
    cy.url().should("include", "/register");
  });

  it("should validate password matching", () => {
    cy.get('[data-testid="name-input"]').type("Test User");
    cy.get('[data-testid="email-input"]').type("test@example.com");

    cy.get('[data-testid="password-input"]').type("Password1$");

    cy.get('[data-testid="confirm-password-input"]').type(
      "DifferentPassword1$",
    );

    cy.get('[data-testid="signup-button"]').click();

    cy.get('[data-testid="error-message"]').should("be.visible");
    cy.get('[data-testid="error-message"]').should(
      "contain",
      "Passwords do not match",
    );

    cy.url().should("include", "/register");
  });

  it("should allow registration with valid data", () => {
    const randomEmail = `test${Math.floor(Math.random() * 10000)}@example.com`;

    cy.get('[data-testid="name-input"]').type("Test User");
    cy.get('[data-testid="email-input"]').type(randomEmail);

    cy.get('[data-testid="password-input"]').type("Password1$");

    cy.get('[data-testid="confirm-password-input"]').type("Password1$");

    cy.get('[data-testid="signup-button"]').click();

    cy.url().should("eq", Cypress.config().baseUrl + "/");
  });

  it("should show error message with invalid email", () => {
    cy.get('[data-testid="name-input"]').type("Test User");
    cy.get('[data-testid="email-input"]').type("invalid-email");
    cy.get('[data-testid="password-input"]').type("Password1$");
    cy.get('[data-testid="confirm-password-input"]').type("Password1$");

    cy.get('[data-testid="signup-button"]').click();

    cy.get('[data-testid="error-message"]').should("be.visible");
    cy.get('[data-testid="error-message"]').should("contain", "Invalid Email");

    cy.url().should("include", "/register");
  });
});
