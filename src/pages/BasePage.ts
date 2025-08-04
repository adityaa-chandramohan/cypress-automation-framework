import { ElementOptions, PageElement, LogLevel } from '../types';

export abstract class BasePage {
  protected url: string;
  protected elements: Record<string, PageElement>;
  protected expectedElements: string[];
  protected loadTimeout: number;

  constructor(url: string, elements: Record<string, PageElement>, expectedElements: string[] = [], loadTimeout: number = 30000) {
    this.url = url;
    this.elements = elements;
    this.expectedElements = expectedElements;
    this.loadTimeout = loadTimeout;
  }

  // Navigation methods
  visit(options?: any): Cypress.Chainable<void> {
    cy.addTestLog(`Navigating to ${this.constructor.name}`, 'info');
    return cy.visit(this.url, options).then(() => {
      this.waitForPageLoad();
    });
  }

  waitForPageLoad(): Cypress.Chainable<void> {
    cy.addTestLog(`Waiting for ${this.constructor.name} to load`, 'info');
    
    if (this.expectedElements.length > 0) {
      this.expectedElements.forEach(elementKey => {
        const element = this.elements[elementKey];
        if (element) {
          cy.waitForElement(element.selector, this.loadTimeout);
        }
      });
    }
    
    return cy.url().should('include', this.getUrlPath());
  }

  protected getUrlPath(): string {
    try {
      return new URL(this.url).pathname;
    } catch {
      return this.url;
    }
  }

  // Element interaction methods with auto-healing
  getElement(elementKey: string, options?: ElementOptions): Cypress.Chainable<JQuery<HTMLElement>> {
    const element = this.elements[elementKey];
    if (!element) {
      throw new Error(`Element '${elementKey}' not found in ${this.constructor.name}`);
    }

    cy.addTestLog(`Getting element: ${element.name}`, 'debug');
    
    const mergedOptions = { ...element.options, ...options };
    return cy.getWithHealing(element.selector, mergedOptions);
  }

  clickElement(elementKey: string, options?: ElementOptions): Cypress.Chainable<void> {
    const element = this.elements[elementKey];
    if (!element) {
      throw new Error(`Element '${elementKey}' not found in ${this.constructor.name}`);
    }

    cy.addTestLog(`Clicking element: ${element.name}`, 'info');
    
    const mergedOptions = { ...element.options, ...options };
    return cy.clickWithHealing(element.selector, mergedOptions);
  }

  typeInElement(elementKey: string, text: string, options?: ElementOptions): Cypress.Chainable<void> {
    const element = this.elements[elementKey];
    if (!element) {
      throw new Error(`Element '${elementKey}' not found in ${this.constructor.name}`);
    }

    cy.addTestLog(`Typing in element: ${element.name}`, 'info');
    
    const mergedOptions = { ...element.options, ...options };
    return cy.typeWithHealing(element.selector, text, mergedOptions);
  }

  clearAndType(elementKey: string, text: string, options?: ElementOptions): Cypress.Chainable<void> {
    return this.getElement(elementKey, options).clear().then(() => {
      this.typeInElement(elementKey, text, options);
    });
  }

  selectOption(elementKey: string, value: string, options?: ElementOptions): Cypress.Chainable<void> {
    const element = this.elements[elementKey];
    if (!element) {
      throw new Error(`Element '${elementKey}' not found in ${this.constructor.name}`);
    }

    cy.addTestLog(`Selecting option '${value}' in: ${element.name}`, 'info');
    
    return this.getElement(elementKey, options).select(value);
  }

  checkElement(elementKey: string, options?: ElementOptions): Cypress.Chainable<void> {
    const element = this.elements[elementKey];
    if (!element) {
      throw new Error(`Element '${elementKey}' not found in ${this.constructor.name}`);
    }

    cy.addTestLog(`Checking element: ${element.name}`, 'info');
    
    return this.getElement(elementKey, options).check();
  }

  uncheckElement(elementKey: string, options?: ElementOptions): Cypress.Chainable<void> {
    const element = this.elements[elementKey];
    if (!element) {
      throw new Error(`Element '${elementKey}' not found in ${this.constructor.name}`);
    }

    cy.addTestLog(`Unchecking element: ${element.name}`, 'info');
    
    return this.getElement(elementKey, options).uncheck();
  }

  // Assertion methods
  shouldBeVisible(elementKey: string, options?: ElementOptions): Cypress.Chainable<JQuery<HTMLElement>> {
    const element = this.elements[elementKey];
    if (!element) {
      throw new Error(`Element '${elementKey}' not found in ${this.constructor.name}`);
    }

    cy.addTestLog(`Verifying element is visible: ${element.name}`, 'info');
    
    return this.getElement(elementKey, options).should('be.visible');
  }

  shouldNotBeVisible(elementKey: string, options?: ElementOptions): Cypress.Chainable<JQuery<HTMLElement>> {
    const element = this.elements[elementKey];
    if (!element) {
      throw new Error(`Element '${elementKey}' not found in ${this.constructor.name}`);
    }

    cy.addTestLog(`Verifying element is not visible: ${element.name}`, 'info');
    
    return this.getElement(elementKey, options).should('not.be.visible');
  }

  shouldContainText(elementKey: string, text: string, options?: ElementOptions): Cypress.Chainable<JQuery<HTMLElement>> {
    const element = this.elements[elementKey];
    if (!element) {
      throw new Error(`Element '${elementKey}' not found in ${this.constructor.name}`);
    }

    cy.addTestLog(`Verifying element contains text '${text}': ${element.name}`, 'info');
    
    return this.getElement(elementKey, options).should('contain', text);
  }

  shouldHaveValue(elementKey: string, value: string, options?: ElementOptions): Cypress.Chainable<JQuery<HTMLElement>> {
    const element = this.elements[elementKey];
    if (!element) {
      throw new Error(`Element '${elementKey}' not found in ${this.constructor.name}`);
    }

    cy.addTestLog(`Verifying element has value '${value}': ${element.name}`, 'info');
    
    return this.getElement(elementKey, options).should('have.value', value);
  }

  shouldHaveAttribute(elementKey: string, attribute: string, value?: string, options?: ElementOptions): Cypress.Chainable<JQuery<HTMLElement>> {
    const element = this.elements[elementKey];
    if (!element) {
      throw new Error(`Element '${elementKey}' not found in ${this.constructor.name}`);
    }

    const logMessage = value 
      ? `Verifying element has attribute '${attribute}' with value '${value}': ${element.name}`
      : `Verifying element has attribute '${attribute}': ${element.name}`;
    
    cy.addTestLog(logMessage, 'info');
    
    const assertion = value ? `have.attr,${attribute},${value}` : `have.attr,${attribute}`;
    return this.getElement(elementKey, options).should(assertion as any);
  }

  // Utility methods
  scrollToElement(elementKey: string, options?: ElementOptions): Cypress.Chainable<void> {
    const element = this.elements[elementKey];
    if (!element) {
      throw new Error(`Element '${elementKey}' not found in ${this.constructor.name}`);
    }

    cy.addTestLog(`Scrolling to element: ${element.name}`, 'info');
    
    return cy.scrollIntoViewport(element.selector);
  }

  hoverElement(elementKey: string, options?: ElementOptions): Cypress.Chainable<void> {
    const element = this.elements[elementKey];
    if (!element) {
      throw new Error(`Element '${elementKey}' not found in ${this.constructor.name}`);
    }

    cy.addTestLog(`Hovering over element: ${element.name}`, 'info');
    
    return this.getElement(elementKey, options).realHover();
  }

  rightClickElement(elementKey: string, options?: ElementOptions): Cypress.Chainable<void> {
    const element = this.elements[elementKey];
    if (!element) {
      throw new Error(`Element '${elementKey}' not found in ${this.constructor.name}`);
    }

    cy.addTestLog(`Right clicking element: ${element.name}`, 'info');
    
    return this.getElement(elementKey, options).rightclick();
  }

  doubleClickElement(elementKey: string, options?: ElementOptions): Cypress.Chainable<void> {
    const element = this.elements[elementKey];
    if (!element) {
      throw new Error(`Element '${elementKey}' not found in ${this.constructor.name}`);
    }

    cy.addTestLog(`Double clicking element: ${element.name}`, 'info');
    
    return this.getElement(elementKey, options).dblclick();
  }

  // Wait methods
  waitForElementToBeVisible(elementKey: string, timeout?: number): Cypress.Chainable<JQuery<HTMLElement>> {
    const element = this.elements[elementKey];
    if (!element) {
      throw new Error(`Element '${elementKey}' not found in ${this.constructor.name}`);
    }

    cy.addTestLog(`Waiting for element to be visible: ${element.name}`, 'info');
    
    return cy.waitForElement(element.selector, timeout);
  }

  waitForTextInElement(elementKey: string, text: string, timeout?: number): Cypress.Chainable<void> {
    const element = this.elements[elementKey];
    if (!element) {
      throw new Error(`Element '${elementKey}' not found in ${this.constructor.name}`);
    }

    cy.addTestLog(`Waiting for text '${text}' in element: ${element.name}`, 'info');
    
    return cy.waitForText(element.selector, text, timeout);
  }

  // Visual testing methods
  capturePageScreenshot(name?: string): Cypress.Chainable<void> {
    const screenshotName = name || this.constructor.name.toLowerCase();
    cy.addTestLog(`Capturing screenshot: ${screenshotName}`, 'info');
    
    return cy.compareSnapshot(screenshotName);
  }

  captureElementScreenshot(elementKey: string, name?: string): Cypress.Chainable<void> {
    const element = this.elements[elementKey];
    if (!element) {
      throw new Error(`Element '${elementKey}' not found in ${this.constructor.name}`);
    }

    const screenshotName = name || `${this.constructor.name.toLowerCase()}-${elementKey}`;
    cy.addTestLog(`Capturing element screenshot: ${screenshotName}`, 'info');
    
    return this.getElement(elementKey).then(($el) => {
      cy.compareSnapshot(screenshotName, { clip: $el[0].getBoundingClientRect() });
    });
  }

  // Abstract methods that subclasses must implement
  abstract isLoaded(): Cypress.Chainable<boolean>;
  
  // Optional method for custom validation
  validatePage(): Cypress.Chainable<void> {
    cy.addTestLog(`Validating ${this.constructor.name}`, 'info');
    
    return this.isLoaded().then((loaded) => {
      if (!loaded) {
        throw new Error(`${this.constructor.name} validation failed`);
      }
    });
  }

  // Method to get all elements for debugging
  getAllElements(): Record<string, PageElement> {
    return this.elements;
  }

  // Method to check if element exists
  elementExists(elementKey: string): boolean {
    return elementKey in this.elements;
  }

  // Method to get element info
  getElementInfo(elementKey: string): PageElement | undefined {
    return this.elements[elementKey];
  }
}