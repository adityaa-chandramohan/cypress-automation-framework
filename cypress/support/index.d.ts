/// <reference types="cypress" />
/// <reference types="allure-cypress" />
/// <reference types="cypress-visual-regression" />

declare namespace Cypress {
  interface Chainable {
    // Auto-healing commands
    getWithHealing(selector: string, options?: any): Chainable<JQuery<HTMLElement>>;
    clickWithHealing(selector: string, options?: any): Chainable<void>;
    typeWithHealing(selector: string, text: string, options?: any): Chainable<void>;
    
    // Visual testing commands
    compareSnapshot(name: string, options?: any): Chainable<void>;
    captureBaseline(name: string, options?: any): Chainable<void>;
    
    // Utility commands
    addTestLog(message: string, level?: 'info' | 'warn' | 'error'): Chainable<void>;
    waitForElement(selector: string, timeout?: number): Chainable<JQuery<HTMLElement>>;
    waitForText(selector: string, text: string, timeout?: number): Chainable<void>;
    scrollIntoViewport(selector: string): Chainable<void>;
    dragAndDrop(sourceSelector: string, targetSelector: string): Chainable<void>;
    
    // API commands
    apiRequest(method: string, url: string, body?: any, headers?: any): Chainable<any>;
    
    // Test data commands
    generateTestData(type: string): Chainable<any>;
    
    // Auto-healing specific
    shouldExistWithHealing(selector: string): Chainable<JQuery<HTMLElement>>;
  }

  interface AUTWindow {
    originalQuerySelector?: typeof Document.prototype.querySelector;
    originalQuerySelectorAll?: typeof Document.prototype.querySelectorAll;
    webkitRTCPeerConnection?: RTCPeerConnection;
    mozRTCPeerConnection?: RTCPeerConnection;
  }

  interface Test {
    title: string;
    titlePath: string[];
    state?: 'passed' | 'failed' | 'pending';
  }
}