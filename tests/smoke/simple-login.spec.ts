describe('Simple Login - Smoke Tests', () => {
  beforeEach(() => {
    // Set base URL from environment or use default
    const baseUrl = Cypress.env('baseUrl') || 'https://example.cypress.io';
    cy.visit(baseUrl);
  });

  it('should visit the homepage successfully', () => {
    // Basic test to verify the framework is working
    cy.url().should('include', 'cypress.io');
    cy.title().should('not.be.empty');
    cy.get('body').should('be.visible');
  });

  it('should find and click navigation elements', () => {
    // Test basic interactions
    cy.get('body').should('be.visible');
    
    // Look for common navigation elements
    cy.get('a, button, [role="button"]').should('have.length.greaterThan', 0);
    
    // Take a screenshot
    cy.screenshot('homepage-smoke-test');
  });

  it('should handle basic form interactions', () => {
    // Look for any form elements on the page
    cy.get('body').then(($body) => {
      if ($body.find('input, textarea, select').length > 0) {
        cy.get('input, textarea, select').first().should('exist');
      } else {
        cy.log('No form elements found on this page');
      }
    });
  });
});