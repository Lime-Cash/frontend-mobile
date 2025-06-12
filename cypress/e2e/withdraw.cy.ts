describe("Withdraw functionality", () => {
  beforeEach(() => {
    cy.visit("/login");
    cy.get('[data-testid="email-input"]').type("tomi.serra@gmail.com");
    cy.get('[data-testid="password-input"]').type("Tomi1234$");
    cy.get('[data-testid="signin-button"]').click();

    cy.url().should("eq", Cypress.config().baseUrl + "/");
    cy.get('[data-testid="withdraw-nav-button"]').click();
    cy.url().should("include", "/withdraw");
  });

  it("should disable withdraw button when amount is not entered", () => {
    cy.get('[data-testid="withdraw-money-btn"]').should(
      "have.attr",
      "aria-disabled",
      "true",
    );

    cy.get('[data-testid="cvu-input"]').type("4567890123456789012345");

    cy.get('[data-testid="withdraw-money-btn"]').should(
      "have.attr",
      "aria-disabled",
      "true",
    );
  });

  it("should disable withdraw button when CVU is not entered", () => {
    cy.get('[data-testid="amount-input"]').type("1");

    cy.get('[data-testid="withdraw-money-btn"]').should(
      "have.attr",
      "aria-disabled",
      "true",
    );
  });

  it("should successfully withdraw money using a valid CVU", () => {
    // Get initial balance from home page
    cy.visit("/");
    cy.get('[data-testid="balance-display"]')
      .first()
      .invoke("text")
      .then((initialBalance) => {
        const initialBalanceRaw =
          parseFloat(initialBalance.replace(/\$|,/g, "")) || 0;
        const initialBalanceNum = Number(initialBalanceRaw.toFixed(2));

        // Navigate to withdraw page
        cy.get('[data-testid="withdraw-nav-button"]').click();
        cy.url().should("include", "/withdraw");

        cy.get('[data-testid="amount-input"]').type("1");

        cy.get('[data-testid="cvu-input"]').type("4567890123456789012345");

        cy.get('[data-testid="withdraw-money-btn"]').click();

        cy.url().should("eq", Cypress.config().baseUrl + "/");

        cy.contains("$1 was withdrawn to bank account").should("be.visible");
        cy.reload();

        cy.get('[data-testid="balance-display"]')
          .first()
          .invoke("text")
          .then((newBalance) => {
            // Remove $ symbol, convert to number and round to 2 decimal places
            const newBalanceRaw =
              parseFloat(newBalance.replace(/\$|,/g, "")) || 0;
            const newBalanceNum = Number(newBalanceRaw.toFixed(2));

            expect(newBalanceNum).to.equal(initialBalanceNum - 1);
          });
      });
  });

  it("should show error when withdrawing money with a short CVU", () => {
    cy.get('[data-testid="amount-input"]').type("1");

    cy.get('[data-testid="cvu-input"]').type("1234");

    cy.get('[data-testid="withdraw-money-btn"]').click();

    cy.get('[data-testid="error-message"]').should("be.visible");
    cy.get('[data-testid="error-message"]').should(
      "contain",
      "Invalid CBU. CBU must be a 22-digit string.",
    );
    cy.url().should("include", "/withdraw");
  });

  it("should show error when withdrawing money with a not valid CVU", () => {
    cy.get('[data-testid="amount-input"]').type("1");
    cy.get('[data-testid="cvu-input"]').type("1111111111111111111111");
    cy.get('[data-testid="withdraw-money-btn"]').click();
    cy.get('[data-testid="error-message"]').should("be.visible");
    cy.get('[data-testid="error-message"]').should(
      "contain",
      "Account not found for the provided CBU.",
    );
  });

  it("should show error when withdrawing money with an amount greater than the balance", () => {
    cy.visit("/");
    cy.get('[data-testid="balance-display"]')
      .first()
      .invoke("text")
      .then((initialBalance) => {
        const initialBalanceRaw =
          parseFloat(initialBalance.replace(/\$|,/g, "")) || 0;
        const initialBalanceNum = Number(initialBalanceRaw.toFixed(2));

        // Navigate to withdraw page
        cy.get('[data-testid="withdraw-nav-button"]').click();
        cy.url().should("include", "/withdraw");

        cy.get('[data-testid="amount-input"]').type(
          (initialBalanceNum + 1).toString(),
        );

        cy.get('[data-testid="cvu-input"]').type("4567890123456789012345");

        cy.get('[data-testid="withdraw-money-btn"]').click();

        cy.get('[data-testid="error-message"]').should("be.visible");
        cy.get('[data-testid="error-message"]').should(
          "contain",
          "Insufficient funds",
        );
        cy.url().should("include", "/withdraw");
      });
  });
});
