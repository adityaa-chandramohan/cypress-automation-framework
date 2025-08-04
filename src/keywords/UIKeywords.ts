import { ElementOptions, LogLevel } from '../types';

export class UIKeywords {
  private static retryOptions = {
    retries: 3,
    delay: 1000
  };

  // Enhanced click methods
  static smartClick(selector: string, options: ElementOptions = {}): Cypress.Chainable<void> {
    const mergedOptions = { ...this.retryOptions, ...options };
    
    return cy.addTestLog(`Smart clicking element: ${selector}`, 'info').then(() => {
      return this.withRetry(() => {
        return cy.getWithHealing(selector, mergedOptions).then(($el) => {
          // Check if element is clickable
          if ($el.is(':disabled') || $el.css('pointer-events') === 'none') {
            throw new Error(`Element ${selector} is not clickable`);
          }

          // Scroll into view if needed
          if (!this.isElementVisible($el[0])) {
            cy.scrollIntoViewport(selector);
          }

          // Wait for animations to complete
          cy.waitUntil(() => {
            return cy.get(selector).then(($elem) => {
              const rect = $elem[0].getBoundingClientRect();
              return rect.width > 0 && rect.height > 0;
            });
          });

          return cy.get(selector).click(mergedOptions);
        });
      }, mergedOptions.retries || 3);
    });
  }

  static forceClick(selector: string, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Force clicking element: ${selector}`, 'info');
    return cy.getWithHealing(selector, options).click({ force: true, ...options });
  }

  static clickByText(text: string, elementType: string = '*', options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Clicking element containing text: ${text}`, 'info');
    const selector = `${elementType}:contains("${text}")`;
    return this.smartClick(selector, options);
  }

  static doubleClick(selector: string, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Double clicking element: ${selector}`, 'info');
    return cy.getWithHealing(selector, options).dblclick(options);
  }

  static rightClick(selector: string, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Right clicking element: ${selector}`, 'info');
    return cy.getWithHealing(selector, options).rightclick(options);
  }

  // Enhanced typing methods
  static smartType(selector: string, text: string, options: ElementOptions = {}): Cypress.Chainable<void> {
    const mergedOptions = { delay: 50, ...options };
    
    return cy.addTestLog(`Smart typing '${text}' into element: ${selector}`, 'info').then(() => {
      return this.withRetry(() => {
        return cy.getWithHealing(selector, mergedOptions).then(($el) => {
          // Clear field first if it's not empty
          if ($el.val()) {
            cy.get(selector).clear();
          }

          // Check if element is readonly
          if ($el.prop('readonly')) {
            throw new Error(`Element ${selector} is readonly`);
          }

          return cy.get(selector).type(text, mergedOptions);
        });
      }, mergedOptions.retries || 3);
    });
  }

  static typeSlowly(selector: string, text: string, delay: number = 100, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Typing slowly '${text}' into element: ${selector}`, 'info');
    return cy.getWithHealing(selector, options).type(text, { delay, ...options });
  }

  static replaceText(selector: string, newText: string, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Replacing text with '${newText}' in element: ${selector}`, 'info');
    return cy.getWithHealing(selector, options).clear().type(newText, options);
  }

  static appendText(selector: string, text: string, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Appending text '${text}' to element: ${selector}`, 'info');
    return cy.getWithHealing(selector, options).type(text, options);
  }

  // Dropdown and select methods
  static selectByText(selector: string, text: string, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Selecting option '${text}' from dropdown: ${selector}`, 'info');
    return cy.getWithHealing(selector, options).select(text);
  }

  static selectByValue(selector: string, value: string, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Selecting option by value '${value}' from dropdown: ${selector}`, 'info');
    return cy.getWithHealing(selector, options).select(value);
  }

  static selectByIndex(selector: string, index: number, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Selecting option by index ${index} from dropdown: ${selector}`, 'info');
    return cy.getWithHealing(selector, options).select(index);
  }

  static selectMultiple(selector: string, values: string[], options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Selecting multiple options from dropdown: ${selector}`, 'info');
    return cy.getWithHealing(selector, options).select(values);
  }

  static clickDropdown(selector: string, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Opening dropdown: ${selector}`, 'info');
    return this.smartClick(selector, options);
  }

  // Checkbox and radio methods
  static checkBox(selector: string, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Checking checkbox: ${selector}`, 'info');
    return cy.getWithHealing(selector, options).check(options);
  }

  static uncheckBox(selector: string, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Unchecking checkbox: ${selector}`, 'info');
    return cy.getWithHealing(selector, options).uncheck(options);
  }

  static toggleCheckbox(selector: string, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Toggling checkbox: ${selector}`, 'info');
    return cy.getWithHealing(selector, options).then(($el) => {
      if ($el.is(':checked')) {
        return cy.get(selector).uncheck(options);
      } else {
        return cy.get(selector).check(options);
      }
    });
  }

  static selectRadio(selector: string, value: string, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Selecting radio button '${value}': ${selector}`, 'info');
    return cy.getWithHealing(selector, options).check(value);
  }

  // Waiting methods
  static waitForElement(selector: string, timeout: number = 10000, visible: boolean = true): Cypress.Chainable<JQuery<HTMLElement>> {
    cy.addTestLog(`Waiting for element: ${selector}`, 'info');
    const assertion = visible ? 'be.visible' : 'exist';
    return cy.getWithHealing(selector, { timeout }).should(assertion);
  }

  static waitForElementToDisappear(selector: string, timeout: number = 10000): Cypress.Chainable<void> {
    cy.addTestLog(`Waiting for element to disappear: ${selector}`, 'info');
    return cy.get('body').then(($body) => {
      if ($body.find(selector).length > 0) {
        cy.get(selector, { timeout }).should('not.exist');
      }
    });
  }

  static waitForText(selector: string, text: string, timeout: number = 10000): Cypress.Chainable<JQuery<HTMLElement>> {
    cy.addTestLog(`Waiting for text '${text}' in element: ${selector}`, 'info');
    return cy.getWithHealing(selector, { timeout }).should('contain', text);
  }

  static waitForValue(selector: string, value: string, timeout: number = 10000): Cypress.Chainable<JQuery<HTMLElement>> {
    cy.addTestLog(`Waiting for value '${value}' in element: ${selector}`, 'info');
    return cy.getWithHealing(selector, { timeout }).should('have.value', value);
  }

  static waitForAttributeValue(selector: string, attribute: string, value: string, timeout: number = 10000): Cypress.Chainable<JQuery<HTMLElement>> {
    cy.addTestLog(`Waiting for attribute '${attribute}' to have value '${value}' in element: ${selector}`, 'info');
    return cy.getWithHealing(selector, { timeout }).should('have.attr', attribute, value);
  }

  static waitForCondition(conditionFn: () => Cypress.Chainable<boolean>, timeout: number = 10000, message?: string): Cypress.Chainable<void> {
    const errorMessage = message || 'Condition was not met within timeout';
    cy.addTestLog(`Waiting for custom condition`, 'info');
    
    return cy.waitUntil(conditionFn, {
      timeout,
      interval: 500,
      errorMsg: errorMessage
    });
  }

  // Drag and drop methods
  static dragAndDrop(sourceSelector: string, targetSelector: string, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Dragging from ${sourceSelector} to ${targetSelector}`, 'info');
    
    return cy.getWithHealing(sourceSelector, options).then(($source) => {
      return cy.getWithHealing(targetSelector, options).then(($target) => {
        const sourceRect = $source[0].getBoundingClientRect();
        const targetRect = $target[0].getBoundingClientRect();

        return cy.get(sourceSelector)
          .trigger('mousedown', {
            clientX: sourceRect.x + sourceRect.width / 2,
            clientY: sourceRect.y + sourceRect.height / 2
          })
          .trigger('mousemove', {
            clientX: targetRect.x + targetRect.width / 2,
            clientY: targetRect.y + targetRect.height / 2
          })
          .trigger('mouseup');
      });
    });
  }

  static dragByOffset(selector: string, xOffset: number, yOffset: number, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Dragging element ${selector} by offset (${xOffset}, ${yOffset})`, 'info');
    
    return cy.getWithHealing(selector, options).then(($el) => {
      const rect = $el[0].getBoundingClientRect();
      const startX = rect.x + rect.width / 2;
      const startY = rect.y + rect.height / 2;
      
      return cy.get(selector)
        .trigger('mousedown', { clientX: startX, clientY: startY })
        .trigger('mousemove', { clientX: startX + xOffset, clientY: startY + yOffset })
        .trigger('mouseup');
    });
  }

  // Hover and focus methods
  static hover(selector: string, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Hovering over element: ${selector}`, 'info');
    return cy.getWithHealing(selector, options).realHover();
  }

  static hoverAndClick(selector: string, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Hovering and clicking element: ${selector}`, 'info');
    return this.hover(selector, options).then(() => {
      return this.smartClick(selector, options);
    });
  }

  static focus(selector: string, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Focusing on element: ${selector}`, 'info');
    return cy.getWithHealing(selector, options).focus();
  }

  static blur(selector: string, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Blurring element: ${selector}`, 'info');
    return cy.getWithHealing(selector, options).blur();
  }

  // Scroll methods
  static scrollTo(selector: string, position: 'top' | 'center' | 'bottom' = 'center', options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Scrolling to element: ${selector}`, 'info');
    return cy.getWithHealing(selector, options).scrollIntoView({ block: position });
  }

  static scrollToTop(): Cypress.Chainable<void> {
    cy.addTestLog('Scrolling to top of page', 'info');
    return cy.scrollTo('top');
  }

  static scrollToBottom(): Cypress.Chainable<void> {
    cy.addTestLog('Scrolling to bottom of page', 'info');
    return cy.scrollTo('bottom');
  }

  static scrollInContainer(containerSelector: string, position: number | string, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Scrolling in container ${containerSelector} to position ${position}`, 'info');
    return cy.getWithHealing(containerSelector, options).scrollTo(position);
  }

  // File upload methods
  static uploadFile(selector: string, filePath: string, options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Uploading file ${filePath} to element: ${selector}`, 'info');
    return cy.getWithHealing(selector, options).selectFile(filePath, options);
  }

  static uploadMultipleFiles(selector: string, filePaths: string[], options: ElementOptions = {}): Cypress.Chainable<void> {
    cy.addTestLog(`Uploading multiple files to element: ${selector}`, 'info');
    return cy.getWithHealing(selector, options).selectFile(filePaths, options);
  }

  // Window and frame methods
  static switchToFrame(frameSelector: string): Cypress.Chainable<void> {
    cy.addTestLog(`Switching to frame: ${frameSelector}`, 'info');
    return cy.getWithHealing(frameSelector).its('0.contentDocument.body').should('not.be.empty').then(cy.wrap);
  }

  static openNewTab(url: string): Cypress.Chainable<void> {
    cy.addTestLog(`Opening new tab with URL: ${url}`, 'info');
    return cy.window().then((win) => {
      win.open(url, '_blank');
    });
  }

  // Keyboard methods
  static pressKey(key: string): Cypress.Chainable<void> {
    cy.addTestLog(`Pressing key: ${key}`, 'info');
    return cy.get('body').type(`{${key}}`);
  }

  static pressKeyCombo(keys: string[]): Cypress.Chainable<void> {
    const keyCombo = keys.join('+');
    cy.addTestLog(`Pressing key combination: ${keyCombo}`, 'info');
    return cy.get('body').type(`{${keys.join('+{')}}`);
  }

  static tabToElement(selector: string, maxTabs: number = 20): Cypress.Chainable<void> {
    cy.addTestLog(`Tabbing to element: ${selector}`, 'info');
    
    let attempts = 0;
    const tryTab = (): Cypress.Chainable<void> => {
      return cy.focused().then(($focused) => {
        attempts++;
        
        if ($focused.is(selector) || attempts >= maxTabs) {
          return cy.wrap(null);
        }
        
        return cy.get('body').tab().then(() => tryTab());
      });
    };
    
    return tryTab();
  }

  // Utility methods
  static getText(selector: string, options: ElementOptions = {}): Cypress.Chainable<string> {
    return cy.getWithHealing(selector, options).invoke('text').then(text => text.trim());
  }

  static getValue(selector: string, options: ElementOptions = {}): Cypress.Chainable<string> {
    return cy.getWithHealing(selector, options).invoke('val');
  }

  static getAttribute(selector: string, attribute: string, options: ElementOptions = {}): Cypress.Chainable<string> {
    return cy.getWithHealing(selector, options).invoke('attr', attribute);
  }

  static isVisible(selector: string): Cypress.Chainable<boolean> {
    return cy.get('body').then(($body) => {
      const $el = $body.find(selector);
      return $el.length > 0 && $el.is(':visible');
    });
  }

  static isEnabled(selector: string): Cypress.Chainable<boolean> {
    return cy.getWithHealing(selector).then(($el) => {
      return !$el.is(':disabled');
    });
  }

  static isChecked(selector: string): Cypress.Chainable<boolean> {
    return cy.getWithHealing(selector).then(($el) => {
      return $el.is(':checked');
    });
  }

  static hasClass(selector: string, className: string): Cypress.Chainable<boolean> {
    return cy.getWithHealing(selector).then(($el) => {
      return $el.hasClass(className);
    });
  }

  static getElementCount(selector: string): Cypress.Chainable<number> {
    return cy.get('body').then(($body) => {
      return $body.find(selector).length;
    });
  }

  // Private utility methods
  private static withRetry<T>(fn: () => Cypress.Chainable<T>, maxRetries: number): Cypress.Chainable<T> {
    let attempts = 0;
    
    const attemptFn = (): Cypress.Chainable<T> => {
      attempts++;
      
      return fn().catch((error) => {
        if (attempts < maxRetries) {
          cy.wait(this.retryOptions.delay);
          return attemptFn();
        }
        throw error;
      });
    };
    
    return attemptFn();
  }

  private static isElementVisible(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= viewportHeight &&
      rect.right <= viewportWidth
    );
  }
}