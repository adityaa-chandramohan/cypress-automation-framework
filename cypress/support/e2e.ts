// Import commands and plugins
import './commands';
import 'cypress-real-events';
import 'cypress-wait-until';
import '@cypress/grep';

// Import optional plugins with error handling
try {
  require('allure-cypress');
} catch (error) {
  console.log('Allure cypress support not available');
}

try {
  require('cypress-visual-regression/dist/support');
} catch (error) {
  console.log('Visual regression support not available');
}

// Global configuration and setup
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing the test on uncaught exceptions
  // You can customize this based on your application's behavior
  return false;
});

// Auto-healing setup
beforeEach(() => {
  if (Cypress.env('autoHealing')?.enabled) {
    cy.window().then((win) => {
      // Store original querySelector for fallback
      win.originalQuerySelector = win.document.querySelector;
      win.originalQuerySelectorAll = win.document.querySelectorAll;
    });
  }
});

// Visual testing setup
before(() => {
  if (Cypress.env('visualTesting')?.enabled) {
    cy.task('log', 'Visual testing enabled for this spec');
  }
});

// Custom assertion for auto-healing
Cypress.Commands.add('shouldExistWithHealing', { prevSubject: true }, (subject, selector) => {
  return cy.wrap(subject).should('exist').then(() => {
    if (!subject.length && Cypress.env('autoHealing')?.enabled) {
      cy.log('Element not found, attempting auto-healing...');
      // Auto-healing logic will be implemented in the utils
    }
  });
});

// Global test metadata
beforeEach(() => {
  // Add test metadata for reporting
  const testTitle = Cypress.currentTest.title;
  const testSuite = Cypress.spec.name;
  
  cy.log(`Running test: ${testTitle} in suite: ${testSuite}`);
});

// Global error handling
Cypress.on('fail', (error, runnable) => {
  // Log failure details for auto-healing analysis
  if (Cypress.env('autoHealing')?.enabled) {
    cy.task('log', `Test failed: ${error.message}`);
    cy.task('log', `Runnable: ${runnable.title}`);
  }
  
  // Capture screenshot on failure
  cy.screenshot(`failure-${runnable.title}-${Date.now()}`);
  
  throw error;
});