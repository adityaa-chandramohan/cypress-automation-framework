/// <reference types="cypress" />

// Type definitions moved to cypress/support/index.d.ts

// Auto-healing commands
Cypress.Commands.add('getWithHealing', (selector: string, options = {}) => {
  const autoHealingConfig = Cypress.env('autoHealing');
  
  if (!autoHealingConfig?.enabled) {
    return cy.get(selector, options);
  }
  
  let attempts = 0;
  const maxRetries = autoHealingConfig.maxRetries || 3;
  
  const tryGet = (): Cypress.Chainable<JQuery<HTMLElement>> => {
    attempts++;
    
    return cy.get('body').then(($body) => {
      // Try original selector first
      if ($body.find(selector).length > 0) {
        return cy.get(selector, options);
      }
      
      // If original fails and we haven't exceeded retries, try alternative strategies
      if (attempts <= maxRetries) {
        cy.log(`Auto-healing: Attempt ${attempts} for selector: ${selector}`);
        
        // Strategy 1: Try with different attribute selectors
        const alternatives = generateAlternativeSelectors(selector);
        
        for (const alternative of alternatives) {
          if ($body.find(alternative).length > 0) {
            cy.log(`Auto-healing: Found element with selector: ${alternative}`);
            
            // Log the healing action
            cy.task('updateLocator', {
              selector,
              newSelector: alternative,
              testFile: Cypress.spec.relative
            });
            
            return cy.get(alternative, options);
          }
        }
        
        // If no alternatives work, retry after a short wait
        cy.wait(1000);
        return tryGet();
      }
      
      // If all attempts failed, throw error
      throw new Error(`Auto-healing failed: Element not found with selector "${selector}" after ${maxRetries} attempts`);
    });
  };
  
  return tryGet();
});

Cypress.Commands.add('clickWithHealing', (selector: string, options = {}) => {
  return cy.getWithHealing(selector, options).click(options).then(() => {});
});

Cypress.Commands.add('typeWithHealing', (selector: string, text: string, options = {}) => {
  return cy.getWithHealing(selector, options).type(text, options).then(() => {});
});

// Visual testing commands
Cypress.Commands.add('compareSnapshot', (name: string, options = {}) => {
  if (!Cypress.env('visualTesting')?.enabled) {
    cy.log('Visual testing is disabled');
    return;
  }
  
  const screenshotOptions = {
    capture: 'viewport',
    ...options
  };
  
  cy.screenshot(`actual/${name}`, screenshotOptions).then(() => {
    const actualPath = `cypress/screenshots/actual/${name}.png`;
    const baselinePath = `cypress/screenshots/baseline/${name}.png`;
    
    cy.readFile(baselinePath, 'base64', { timeout: 5000 }).then((baselineExists) => {
      if (!baselineExists) {
        cy.log(`Baseline not found for ${name}, creating baseline...`);
        cy.task('log', `Creating baseline for ${name}`);
        return;
      }
      
      cy.task('compareImages', {
        baseline: baselinePath,
        actual: actualPath
      }).then((result: any) => {
        if (result.error) {
          throw new Error(`Visual comparison failed: ${result.error}`);
        }
        
        if (!result.passed) {
          cy.log(`Visual difference detected: ${result.diffPixels} pixels differ`);
          cy.task('log', `Visual test failed for ${name}: ${result.diffPixels} pixels differ`);
          
          // Attach diff image to allure report
          if ((cy as any).allure) {
            (cy as any).allure().attachment('Visual Diff', result.diffPath, 'image/png');
          }
          
          if (result.diffPixels > (Cypress.env('visualTesting').threshold * 1000)) {
            throw new Error(`Visual regression detected in ${name}`);
          }
        } else {
          cy.log(`Visual comparison passed for ${name}`);
        }
      });
    });
  });
});

Cypress.Commands.add('captureBaseline', (name: string, options = {}) => {
  const screenshotOptions = {
    capture: 'viewport',
    ...options
  };
  
  cy.screenshot(`baseline/${name}`, screenshotOptions);
  cy.log(`Baseline captured for ${name}`);
});

// Utility commands
Cypress.Commands.add('waitForElement', (selector: string, timeout = 10000) => {
  return cy.get(selector, { timeout }).should('be.visible');
});

Cypress.Commands.add('waitForText', (selector: string, text: string, timeout = 10000) => {
  return cy.get(selector, { timeout }).should('contain', text).then(() => {});
});

Cypress.Commands.add('scrollIntoViewport', (selector: string) => {
  return cy.get(selector).scrollIntoView().should('be.visible').then(() => {});
});

Cypress.Commands.add('dragAndDrop', (sourceSelector: string, targetSelector: string) => {
  return cy.get(sourceSelector).then((source) => {
    return cy.get(targetSelector).then((target) => {
      const sourceRect = source[0].getBoundingClientRect();
      const targetRect = target[0].getBoundingClientRect();
      
      return cy.get(sourceSelector)
        .trigger('mousedown', {
          clientX: sourceRect.x + sourceRect.width / 2,
          clientY: sourceRect.y + sourceRect.height / 2
        })
        .trigger('mousemove', {
          clientX: targetRect.x + targetRect.width / 2,
          clientY: targetRect.y + targetRect.height / 2
        })
        .trigger('mouseup')
        .then(() => {});
    });
  });
});

// API commands
Cypress.Commands.add('apiRequest', (method: string, url: string, body?: any, headers?: any) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };
  
  return cy.request({
    method,
    url,
    body,
    headers: defaultHeaders,
    failOnStatusCode: false
  });
});

// Test data commands
Cypress.Commands.add('generateTestData', (type: string) => {
  const { faker } = require('@faker-js/faker');
  
  const testData: any = {};
  
  switch (type) {
    case 'user':
      testData.firstName = faker.name.firstName();
      testData.lastName = faker.name.lastName();
      testData.email = faker.internet.email();
      testData.password = faker.internet.password(12);
      testData.phone = faker.phone.phoneNumber();
      break;
    case 'address':
      testData.street = faker.address.streetAddress();
      testData.city = faker.address.city();
      testData.state = faker.address.state();
      testData.zipCode = faker.address.zipCode();
      testData.country = faker.address.country();
      break;
    case 'company':
      testData.name = faker.company.companyName();
      testData.catchPhrase = faker.company.catchPhrase();
      testData.bs = faker.company.bs();
      break;
    default:
      throw new Error(`Unknown test data type: ${type}`);
  }
  
  return cy.wrap(testData);
});

// Reporting commands
Cypress.Commands.add('addTestLog', (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
  cy.log(message);
  if ((cy as any).allure) {
    (cy as any).allure().step(message);
  }
  cy.task('log', `[${level.toUpperCase()}] ${message}`);
});

// Helper function to generate alternative selectors
function generateAlternativeSelectors(originalSelector: string): string[] {
  const alternatives: string[] = [];
  
  // If it's an ID selector, try class and attribute selectors
  if (originalSelector.startsWith('#')) {
    const id = originalSelector.substring(1);
    alternatives.push(`[id="${id}"]`);
    alternatives.push(`[id*="${id}"]`);
    alternatives.push(`[data-testid="${id}"]`);
    alternatives.push(`[data-cy="${id}"]`);
  }
  
  // If it's a class selector, try attribute and tag selectors
  if (originalSelector.startsWith('.')) {
    const className = originalSelector.substring(1);
    alternatives.push(`[class*="${className}"]`);
    alternatives.push(`[data-testid*="${className}"]`);
    alternatives.push(`[data-cy*="${className}"]`);
  }
  
  // Try common test attributes
  const testAttributes = ['data-testid', 'data-cy', 'data-test', 'aria-label', 'title', 'name'];
  
  testAttributes.forEach(attr => {
    alternatives.push(`[${attr}*="${originalSelector.replace(/[#.]/, '')}"]`);
  });
  
  // Try text-based selectors
  alternatives.push(`:contains("${originalSelector.replace(/[#.]/, '')}")`);
  
  return alternatives;
}

export {};