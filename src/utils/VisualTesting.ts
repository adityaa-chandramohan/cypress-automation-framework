import { VisualComparisonResult, VisualTestingConfig } from '../types';

export class VisualTesting {
  private static instance: VisualTesting;
  private config: VisualTestingConfig;
  private testResults: VisualComparisonResult[] = [];

  private constructor() {
    this.config = Cypress.env('visualTesting') || {
      enabled: true,
      threshold: 0.1,
      baselineDir: 'cypress/screenshots/baseline',
      diffDir: 'cypress/screenshots/diff',
      actualDir: 'cypress/screenshots/actual'
    };
  }

  public static getInstance(): VisualTesting {
    if (!VisualTesting.instance) {
      VisualTesting.instance = new VisualTesting();
    }
    return VisualTesting.instance;
  }

  // Main visual comparison method
  static compareScreenshot(
    name: string, 
    options: VisualComparisonOptions = {}
  ): Cypress.Chainable<VisualComparisonResult> {
    const instance = VisualTesting.getInstance();
    return instance.performComparison(name, options);
  }

  // Capture baseline screenshots
  static captureBaseline(
    name: string, 
    options: ScreenshotOptions = {}
  ): Cypress.Chainable<void> {
    const instance = VisualTesting.getInstance();
    return instance.captureBaselineImage(name, options);
  }

  // Full page comparison
  static compareFullPage(
    name: string, 
    options: VisualComparisonOptions = {}
  ): Cypress.Chainable<VisualComparisonResult> {
    const mergedOptions = { capture: 'fullPage', ...options };
    return this.compareScreenshot(name, mergedOptions);
  }

  // Element comparison
  static compareElement(
    selector: string, 
    name: string, 
    options: VisualComparisonOptions = {}
  ): Cypress.Chainable<VisualComparisonResult> {
    return cy.getWithHealing(selector).then(($el) => {
      const rect = $el[0].getBoundingClientRect();
      const elementOptions = {
        clip: {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        },
        ...options
      };
      
      return VisualTesting.compareScreenshot(name, elementOptions);
    });
  }

  // Viewport comparison
  static compareViewport(
    name: string, 
    options: VisualComparisonOptions = {}
  ): Cypress.Chainable<VisualComparisonResult> {
    const mergedOptions = { capture: 'viewport', ...options };
    return this.compareScreenshot(name, mergedOptions);
  }

  // Responsive comparison
  static compareResponsive(
    name: string, 
    viewports: ViewportConfig[], 
    options: VisualComparisonOptions = {}
  ): Cypress.Chainable<VisualComparisonResult[]> {
    const results: VisualComparisonResult[] = [];
    
    const compareViewport = (index: number): Cypress.Chainable<VisualComparisonResult[]> => {
      if (index >= viewports.length) {
        return cy.wrap(results);
      }
      
      const viewport = viewports[index];
      const viewportName = `${name}-${viewport.name || `${viewport.width}x${viewport.height}`}`;
      
      return cy.viewport(viewport.width, viewport.height).then(() => {
        cy.wait(500); // Allow time for responsive changes
        
        return this.compareScreenshot(viewportName, options).then((result) => {
          results.push(result);
          return compareViewport(index + 1);
        });
      });
    };
    
    return compareViewport(0);
  }

  // Cross-browser comparison
  static compareCrossBrowser(
    name: string, 
    browsers: string[], 
    options: VisualComparisonOptions = {}
  ): Cypress.Chainable<VisualComparisonResult[]> {
    // This would typically be implemented as part of a CI/CD pipeline
    // where different browsers run the same test
    const browserName = Cypress.browser.name;
    const browserSpecificName = `${name}-${browserName}`;
    
    return this.compareScreenshot(browserSpecificName, options).then((result) => {
      return [result]; // In a real implementation, this would aggregate results from all browsers
    });
  }

  // Animation testing
  static compareAfterAnimation(
    name: string, 
    animationDuration: number = 1000, 
    options: VisualComparisonOptions = {}
  ): Cypress.Chainable<VisualComparisonResult> {
    cy.addTestLog(`Waiting ${animationDuration}ms for animations to complete`, 'info');
    
    return cy.wait(animationDuration).then(() => {
      return this.compareScreenshot(name, options);
    });
  }

  // Hover state comparison
  static compareHoverState(
    hoverSelector: string, 
    name: string, 
    options: VisualComparisonOptions = {}
  ): Cypress.Chainable<VisualComparisonResult> {
    return cy.getWithHealing(hoverSelector).realHover().then(() => {
      cy.wait(200); // Allow time for hover effects
      return this.compareScreenshot(`${name}-hover`, options);
    });
  }

  // Focus state comparison
  static compareFocusState(
    focusSelector: string, 
    name: string, 
    options: VisualComparisonOptions = {}
  ): Cypress.Chainable<VisualComparisonResult> {
    return cy.getWithHealing(focusSelector).focus().then(() => {
      cy.wait(200); // Allow time for focus effects
      return this.compareScreenshot(`${name}-focus`, options);
    });
  }

  // Private implementation methods
  private performComparison(
    name: string, 
    options: VisualComparisonOptions
  ): Cypress.Chainable<VisualComparisonResult> {
    if (!this.config.enabled) {
      cy.addTestLog('Visual testing is disabled', 'warn');
      return cy.wrap({ passed: true, diffPixels: 0 });
    }

    cy.addTestLog(`Performing visual comparison: ${name}`, 'info');

    const screenshotOptions = this.buildScreenshotOptions(options);
    const actualPath = `${this.config.actualDir}/${name}.png`;
    const baselinePath = `${this.config.baselineDir}/${name}.png`;

    return cy.screenshot(name, screenshotOptions).then(() => {
      return this.performImageComparison(name, baselinePath, actualPath, options);
    });
  }

  private captureBaselineImage(
    name: string, 
    options: ScreenshotOptions
  ): Cypress.Chainable<void> {
    cy.addTestLog(`Capturing baseline image: ${name}`, 'info');
    
    const screenshotOptions = {
      ...options,
      overwrite: true
    };

    // Ensure baseline directory exists
    const baselinePath = `${this.config.baselineDir}/${name}`;
    
    return cy.task('ensureDir', this.config.baselineDir, { failOnError: false }).then(() => {
      return cy.screenshot(baselinePath, screenshotOptions);
    });
  }

  private performImageComparison(
    name: string,
    baselinePath: string,
    actualPath: string,
    options: VisualComparisonOptions
  ): Cypress.Chainable<VisualComparisonResult> {
    return cy.readFile(baselinePath, 'base64', { failOnError: false }).then((baselineExists) => {
      if (!baselineExists) {
        cy.addTestLog(`No baseline found for ${name}, treating as new baseline`, 'warn');
        
        return cy.task('copyFile', { source: actualPath, destination: baselinePath }).then(() => {
          return { passed: true, diffPixels: 0 } as VisualComparisonResult;
        });
      }

      return cy.task('compareImages', {
        baseline: baselinePath,
        actual: actualPath,
        diff: `${this.config.diffDir}/${name}-diff.png`,
        threshold: options.threshold || this.config.threshold,
        ...options
      }).then((result: VisualComparisonResult) => {
        this.logComparisonResult(name, result);
        this.testResults.push(result);
        
        if (!result.passed && options.failOnDifference !== false) {
          this.attachDiffToReport(name, result);
        }
        
        return result;
      });
    });
  }

  private buildScreenshotOptions(options: VisualComparisonOptions): any {
    const screenshotOptions: any = {
      overwrite: true,
      disableTimersAndAnimations: options.disableAnimations !== false,
      blackout: options.blackout || [],
      clip: options.clip
    };

    if (options.capture) {
      screenshotOptions.capture = options.capture;
    }

    return screenshotOptions;
  }

  private logComparisonResult(name: string, result: VisualComparisonResult): void {
    if (result.passed) {
      cy.addTestLog(`Visual comparison passed: ${name}`, 'info');
    } else {
      const message = `Visual comparison failed: ${name} (${result.diffPixels} pixels differ)`;
      cy.addTestLog(message, result.diffPixels > 100 ? 'error' : 'warn');
    }
  }

  private attachDiffToReport(name: string, result: VisualComparisonResult): void {
    if (result.diffPath) {
      // Attach to Allure report
      (cy as any).allure().attachment(`Visual Diff - ${name}`, result.diffPath, 'image/png');
      
      // Log diff image path
      cy.addTestLog(`Diff image saved: ${result.diffPath}`, 'info');
    }
  }

  // Utility methods
  static enableVisualTesting(): void {
    const instance = VisualTesting.getInstance();
    instance.config.enabled = true;
    Cypress.env('visualTesting', { ...Cypress.env('visualTesting'), enabled: true });
  }

  static disableVisualTesting(): void {
    const instance = VisualTesting.getInstance();
    instance.config.enabled = false;
    Cypress.env('visualTesting', { ...Cypress.env('visualTesting'), enabled: false });
  }

  static setThreshold(threshold: number): void {
    const instance = VisualTesting.getInstance();
    instance.config.threshold = threshold;
    Cypress.env('visualTesting', { ...Cypress.env('visualTesting'), threshold });
  }

  static generateVisualReport(): Cypress.Chainable<any> {
    const instance = VisualTesting.getInstance();
    
    const report = {
      timestamp: new Date().toISOString(),
      testSuite: Cypress.spec.name,
      totalComparisons: instance.testResults.length,
      passed: instance.testResults.filter(r => r.passed).length,
      failed: instance.testResults.filter(r => !r.passed).length,
      results: instance.testResults,
      configuration: instance.config
    };

    const reportPath = `reports/visual-testing-${Date.now()}.json`;
    
    return cy.writeFile(reportPath, report).then(() => {
      cy.addTestLog(`Visual testing report generated: ${reportPath}`, 'info');
      return report;
    });
  }

  static getVisualTestResults(): VisualComparisonResult[] {
    const instance = VisualTesting.getInstance();
    return [...instance.testResults];
  }

  static clearVisualTestResults(): void {
    const instance = VisualTesting.getInstance();
    instance.testResults = [];
  }

  // Batch comparison methods
  static compareMultipleElements(
    elements: Array<{ selector: string; name: string }>, 
    options: VisualComparisonOptions = {}
  ): Cypress.Chainable<VisualComparisonResult[]> {
    const results: VisualComparisonResult[] = [];
    
    const compareNext = (index: number): Cypress.Chainable<VisualComparisonResult[]> => {
      if (index >= elements.length) {
        return cy.wrap(results);
      }
      
      const element = elements[index];
      return this.compareElement(element.selector, element.name, options).then((result) => {
        results.push(result);
        return compareNext(index + 1);
      });
    };
    
    return compareNext(0);
  }

  static comparePageStates(
    states: Array<{ name: string; setup: () => void }>, 
    baselineName: string, 
    options: VisualComparisonOptions = {}
  ): Cypress.Chainable<VisualComparisonResult[]> {
    const results: VisualComparisonResult[] = [];
    
    const compareState = (index: number): Cypress.Chainable<VisualComparisonResult[]> => {
      if (index >= states.length) {
        return cy.wrap(results);
      }
      
      const state = states[index];
      
      return cy.then(() => {
        state.setup();
        cy.wait(500); // Allow state to settle
        
        const stateName = `${baselineName}-${state.name}`;
        return this.compareScreenshot(stateName, options).then((result) => {
          results.push(result);
          return compareState(index + 1);
        });
      });
    };
    
    return compareState(0);
  }

  // Helper methods for image processing
  static maskElements(selectors: string[]): VisualComparisonOptions {
    return {
      blackout: selectors
    };
  }

  static clipToElement(selector: string): Cypress.Chainable<VisualComparisonOptions> {
    return cy.getWithHealing(selector).then(($el) => {
      const rect = $el[0].getBoundingClientRect();
      return {
        clip: {
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height
        }
      };
    });
  }

  static waitForElementStable(
    selector: string, 
    timeout: number = 5000
  ): Cypress.Chainable<void> {
    let lastRect: DOMRect;
    const startTime = Date.now();
    
    const checkStability = (): Cypress.Chainable<void> => {
      return cy.getWithHealing(selector).then(($el) => {
        const currentRect = $el[0].getBoundingClientRect();
        
        if (lastRect && 
            lastRect.x === currentRect.x && 
            lastRect.y === currentRect.y && 
            lastRect.width === currentRect.width && 
            lastRect.height === currentRect.height) {
          return cy.wrap(null);
        }
        
        lastRect = currentRect;
        
        if (Date.now() - startTime > timeout) {
          cy.addTestLog(`Element ${selector} did not stabilize within ${timeout}ms`, 'warn');
          return cy.wrap(null);
        }
        
        return cy.wait(100).then(() => checkStability());
      });
    };
    
    return checkStability();
  }
}

// Type definitions
interface VisualComparisonOptions {
  threshold?: number;
  capture?: 'fullPage' | 'viewport' | 'runner';
  clip?: { x: number; y: number; width: number; height: number };
  blackout?: string[];
  disableAnimations?: boolean;
  failOnDifference?: boolean;
}

interface ScreenshotOptions {
  capture?: 'fullPage' | 'viewport' | 'runner';
  clip?: { x: number; y: number; width: number; height: number };
  blackout?: string[];
  overwrite?: boolean;
}

interface ViewportConfig {
  width: number;
  height: number;
  name?: string;
}

// Predefined viewport configurations
export const commonViewports: ViewportConfig[] = [
  { width: 375, height: 667, name: 'mobile-portrait' },
  { width: 667, height: 375, name: 'mobile-landscape' },
  { width: 768, height: 1024, name: 'tablet-portrait' },
  { width: 1024, height: 768, name: 'tablet-landscape' },
  { width: 1280, height: 720, name: 'desktop' },
  { width: 1920, height: 1080, name: 'desktop-large' }
];

// Utility functions
export const visualUtils = {
  // Common masking patterns
  maskDynamicContent: (): string[] => [
    '[data-testid="timestamp"]',
    '.timestamp',
    '.date',
    '.clock',
    '.loading',
    '.spinner'
  ],
  
  maskUserSpecificContent: (): string[] => [
    '[data-testid="username"]',
    '.username',
    '.user-id',
    '.profile-picture',
    '.avatar'
  ],
  
  // Common viewport sets
  mobileViewports: commonViewports.slice(0, 2),
  tabletViewports: commonViewports.slice(2, 4),
  desktopViewports: commonViewports.slice(4, 6),
  
  // Helper for batch baseline creation
  createBaselinesForViewports: (
    name: string, 
    viewports: ViewportConfig[] = commonViewports
  ): Cypress.Chainable<void> => {
    let index = 0;
    
    const captureNext = (): Cypress.Chainable<void> => {
      if (index >= viewports.length) {
        return cy.wrap(null);
      }
      
      const viewport = viewports[index];
      const viewportName = `${name}-${viewport.name || `${viewport.width}x${viewport.height}`}`;
      
      return cy.viewport(viewport.width, viewport.height).then(() => {
        cy.wait(500);
        return VisualTesting.captureBaseline(viewportName).then(() => {
          index++;
          return captureNext();
        });
      });
    };
    
    return captureNext();
  }
};