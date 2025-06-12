describe("Load functionality", () => {
  beforeEach(() => {
    cy.visit("/login");
    cy.get('[data-testid="email-input"]').type("tomi.serra@gmail.com");
    cy.get('[data-testid="password-input"]').type("Tomi1234$");
    cy.get('[data-testid="signin-button"]').click();

    cy.url().should("eq", Cypress.config().baseUrl + "/");
    cy.get('[data-testid="load-nav-button"]').click();
    cy.url().should("include", "/load");
  });

  it("should disable load button when amount is not entered", () => {
    cy.get('[data-testid="load-money-btn"]').should(
      "have.attr",
      "aria-disabled",
      "true",
    );

    cy.get('[data-testid="cvu-input"]').type("4567890123456789012345");

    cy.get('[data-testid="load-money-btn"]').should(
      "have.attr",
      "aria-disabled",
      "true",
    );
  });

  it("should disable load button when CVU is not entered", () => {
    cy.get('[data-testid="amount-input"]').type("1");

    cy.get('[data-testid="load-money-btn"]').should(
      "have.attr",
      "aria-disabled",
      "true",
    );
  });

  it("should successfully load money using a valid CVU", () => {
    cy.visit("/");
    cy.get('[data-testid="balance-display"]')
      .first()
      .invoke("text")
      .then((initialBalance) => {
        const initialBalanceRaw =
          parseFloat(initialBalance.replace(/\$|,/g, "")) || 0;
        const initialBalanceNum = Number(initialBalanceRaw.toFixed(2));

        cy.get('[data-testid="load-nav-button"]').click();
        cy.url().should("include", "/load");

        cy.get('[data-testid="amount-input"]').type("1");

        cy.get('[data-testid="cvu-input"]').type("4567890123456789012345");

        cy.get('[data-testid="load-money-btn"]').click();

        cy.url().should("eq", Cypress.config().baseUrl + "/");

        cy.contains("$1 was loaded from bank account").should("be.visible");
        cy.reload();

        cy.get('[data-testid="balance-display"]')
          .first()
          .invoke("text")
          .then((newBalance) => {
            const newBalanceRaw =
              parseFloat(newBalance.replace(/\$|,/g, "")) || 0;
            const newBalanceNum = Number(newBalanceRaw.toFixed(2));

            expect(newBalanceNum).to.equal(initialBalanceNum + 1);
          });
      });
  });

  it("should show error when loading money with a short CVU", () => {
    cy.get('[data-testid="amount-input"]').type("1");

    cy.get('[data-testid="cvu-input"]').type("1234");

    cy.get('[data-testid="load-money-btn"]').click();

    cy.get('[data-testid="error-message"]').should("be.visible");
    cy.get('[data-testid="error-message"]').should(
      "contain",
      "Invalid CBU. CBU must be a 22-digit string.",
    );
    cy.url().should("include", "/load");
  });

  it("should show error when loading money with a not valid CVU", () => {
    cy.get('[data-testid="amount-input"]').type("1");
    cy.get('[data-testid="cvu-input"]').type("1111111111111111111111");
    cy.get('[data-testid="load-money-btn"]').click();
    cy.get('[data-testid="error-message"]').should("be.visible");
    cy.get('[data-testid="error-message"]').should(
      "contain",
      "Account not found for the provided CBU.",
    );
  });

  it("should handle maximum limit for loading money", () => {
    cy.get('[data-testid="amount-input"]').type("100000");
    cy.get('[data-testid="cvu-input"]').type("4567890123456789012345");
    cy.get('[data-testid="load-money-btn"]').click();
    cy.get('[data-testid="error-message"]').should("be.visible");
    cy.get('[data-testid="error-message"]').should(
      "contain",
      "Insufficient funds",
    );
    cy.url().should("include", "/load");
  });
});
