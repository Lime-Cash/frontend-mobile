describe("Send Money functionality", () => {
  beforeEach(() => {
    cy.visit("/login");
    cy.get('[data-testid="email-input"]').type("tomi.serra@gmail.com");
    cy.get('[data-testid="password-input"]').type("Tomi1234$");
    cy.get('[data-testid="signin-button"]').click();

    cy.url().should("eq", Cypress.config().baseUrl + "/");
    cy.get('[data-testid="send-nav-button"]').click();
    cy.url().should("include", "/send");
  });

  it("should disable send button when amount is not entered", () => {
    cy.get('[data-testid="send-money-btn"]').should(
      "have.attr",
      "aria-disabled",
      "true"
    );

    cy.get('[data-testid="recipient-email-input"]').type("liz@gmail.com");

    cy.get('[data-testid="send-money-btn"]').should(
      "have.attr",
      "aria-disabled",
      "true"
    );
  });

  it("should disable send button when recipient is not entered", () => {
    cy.get('[data-testid="amount-input"]').type("1");

    cy.get('[data-testid="send-money-btn"]').should(
      "have.attr",
      "aria-disabled",
      "true"
    );
  });

  it("should successfully send money to a valid recipient", () => {
    // Get initial balance from home page
    cy.visit("/");
    cy.get('[data-testid="balance-display"]')
      .first()
      .invoke("text")
      .then((initialBalance) => {
        const initialBalanceRaw =
          parseFloat(initialBalance.replace(/\$|,/g, "")) || 0;
        const initialBalanceNum = Number(initialBalanceRaw.toFixed(2));

        // Navigate to send page
        cy.get('[data-testid="send-nav-button"]').click();
        cy.url().should("include", "/send");

        cy.get('[data-testid="amount-input"]').type("1");

        cy.get('[data-testid="recipient-email-input"]').type("demo@demo.com");

        cy.get('[data-testid="send-money-btn"]').click();

        cy.url().should("eq", Cypress.config().baseUrl + "/");

        cy.contains("$1 was sent to demo@demo.com").should("be.visible");
        cy.reload();

        cy.get('[data-testid="balance-display"]')
          .first()
          .invoke("text")
          .then((newBalance) => {
            console.log(newBalance);
            // Remove $ symbol, convert to number and round to 2 decimal places
            const newBalanceRaw =
              parseFloat(newBalance.replace(/\$|,/g, "")) || 0;
            const newBalanceNum = Number(newBalanceRaw.toFixed(2));

            expect(newBalanceNum).to.equal(initialBalanceNum - 1);
          });
      });
  });

  it("should show error when sending money to invalid recipient", () => {
    cy.get('[data-testid="amount-input"]').type("1");

    cy.get('[data-testid="recipient-email-input"]').type(
      "nonexistent@example.com"
    );

    cy.get('[data-testid="send-money-btn"]').click();

    cy.get('[data-testid="error-message"]').should("be.visible");
    cy.get('[data-testid="error-message"]').should("contain", "User not found");

    cy.url().should("include", "/send");
  });

  it("should show error when sending money to yourself", () => {
    cy.get('[data-testid="amount-input"]').type("1");

    cy.get('[data-testid="recipient-email-input"]').type(
      "tomi.serra@gmail.com"
    );

    cy.get('[data-testid="send-money-btn"]').click();

    cy.get('[data-testid="error-message"]').should("be.visible");
    cy.get('[data-testid="error-message"]').should("contain", "Unknown error");

    cy.url().should("include", "/send");
  });

  it("should show error when sending money with an amount greater than the balance", () => {
    cy.visit("/");
    cy.get('[data-testid="balance-display"]')
      .first()
      .invoke("text")
      .then((initialBalance) => {
        const initialBalanceRaw =
          parseFloat(initialBalance.replace(/\$|,/g, "")) || 0;
        const initialBalanceNum = Number(initialBalanceRaw.toFixed(2));

        // Navigate to send page
        cy.get('[data-testid="send-nav-button"]').click();
        cy.url().should("include", "/send");

        cy.get('[data-testid="amount-input"]').type(
          (initialBalanceNum + 1).toString()
        );

        cy.get('[data-testid="recipient-email-input"]').type("demo@demo.com");

        cy.get('[data-testid="send-money-btn"]').click();

        cy.get('[data-testid="error-message"]').should("be.visible");
        cy.get('[data-testid="error-message"]').should(
          "contain",
          "Unknown error"
        );
        cy.url().should("include", "/send");
      });
  });
});
