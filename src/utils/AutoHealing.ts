import { HealingLog, AutoHealingConfig } from '../types';

export class AutoHealing {
  private static instance: AutoHealing;
  private config: AutoHealingConfig;
  private healingLogs: HealingLog[] = [];

  private constructor() {
    this.config = Cypress.env('autoHealing') || {
      enabled: true,
      sensitivity: 'medium',
      maxRetries: 3,
      reportPath: 'reports/auto-healing.json'
    };
  }

  public static getInstance(): AutoHealing {
    if (!AutoHealing.instance) {
      AutoHealing.instance = new AutoHealing();
    }
    return AutoHealing.instance;
  }

  public static findElementWithHealing(
    originalSelector: string, 
    elementType?: string,
    context?: string
  ): Cypress.Chainable<JQuery<HTMLElement>> {
    const instance = AutoHealing.getInstance();
    return instance.findElement(originalSelector, elementType, context);
  }

  private findElement(
    originalSelector: string, 
    elementType?: string,
    context?: string
  ): Cypress.Chainable<JQuery<HTMLElement>> {
    if (!this.config.enabled) {
      return cy.get(originalSelector);
    }

    let attempts = 0;
    const maxRetries = this.config.maxRetries;

    const attemptFind = (): Cypress.Chainable<JQuery<HTMLElement>> => {
      attempts++;

      return cy.get('body', { log: false }).then(($body) => {
        // Try original selector first
        if ($body.find(originalSelector).length > 0) {
          return cy.get(originalSelector);
        }

        // If original fails and we haven't exceeded retries
        if (attempts <= maxRetries) {
          cy.task('log', `Auto-healing attempt ${attempts} for selector: ${originalSelector}`);
          
          const strategies = this.getHealingStrategies(originalSelector, elementType);
          
          for (const strategy of strategies) {
            for (const selector of strategy.selectors) {
              if ($body.find(selector).length > 0) {
                cy.task('log', `Auto-healing success: Found element with ${strategy.name} strategy using selector: ${selector}`);
                
                this.logHealingAction({
                  timestamp: new Date().toISOString(),
                  testFile: Cypress.spec.relative,
                  oldSelector: originalSelector,
                  newSelector: selector,
                  action: 'element_found',
                  elementType: elementType || 'unknown'
                });

                // Suggest selector update
                this.suggestSelectorUpdate(originalSelector, selector, strategy.name);
                
                return cy.get(selector);
              }
            }
          }

          // If no strategy worked, wait and retry
          if (attempts < maxRetries) {
            cy.wait(this.getRetryDelay(attempts));
            return attemptFind();
          }
        }

        // All attempts failed
        this.logHealingAction({
          timestamp: new Date().toISOString(),
          testFile: Cypress.spec.relative,
          oldSelector: originalSelector,
          newSelector: '',
          action: 'healing_failed',
          elementType: elementType || 'unknown'
        });

        throw new Error(`Auto-healing failed: Element not found with selector "${originalSelector}" after ${maxRetries} attempts using all available strategies`);
      });
    };

    return attemptFind();
  }

  private getHealingStrategies(originalSelector: string, elementType?: string): HealingStrategy[] {
    const strategies: HealingStrategy[] = [];

    // Strategy 1: Alternative attribute selectors
    strategies.push(this.getAttributeStrategy(originalSelector));

    // Strategy 2: Semantic selectors based on element type
    if (elementType) {
      strategies.push(this.getSemanticStrategy(elementType));
    }

    // Strategy 3: Text-based selectors
    strategies.push(this.getTextStrategy(originalSelector));

    // Strategy 4: Structural selectors
    strategies.push(this.getStructuralStrategy(originalSelector));

    // Strategy 5: Role-based selectors
    strategies.push(this.getRoleStrategy(elementType));

    // Strategy 6: Fuzzy matching
    strategies.push(this.getFuzzyMatchingStrategy(originalSelector));

    // Filter strategies based on sensitivity level
    return this.filterStrategiesBySensitivity(strategies);
  }

  private getAttributeStrategy(originalSelector: string): HealingStrategy {
    const selectors: string[] = [];
    
    // Extract identifier from original selector
    const identifier = this.extractIdentifier(originalSelector);
    
    if (identifier) {
      // Try different attribute variations
      const attributes = ['id', 'name', 'data-testid', 'data-cy', 'data-test', 'class', 'aria-label'];
      
      attributes.forEach(attr => {
        selectors.push(`[${attr}="${identifier}"]`);
        selectors.push(`[${attr}*="${identifier}"]`);
        selectors.push(`[${attr}^="${identifier}"]`);
        selectors.push(`[${attr}$="${identifier}"]`);
      });
    }

    return {
      name: 'Attribute Strategy',
      priority: 1,
      selectors
    };
  }

  private getSemanticStrategy(elementType: string): HealingStrategy {
    const selectors: string[] = [];
    
    const semanticMap: Record<string, string[]> = {
      'button': ['button', '[role="button"]', 'input[type="submit"]', 'input[type="button"]'],
      'input': ['input', '[role="textbox"]', 'textarea', '[contenteditable="true"]'],
      'link': ['a', '[role="link"]'],
      'select': ['select', '[role="combobox"]', '[role="listbox"]'],
      'text': ['span', 'div', 'p', '[role="text"]', 'label'],
      'container': ['div', 'section', 'article', '[role="main"]', '[role="region"]']
    };

    if (semanticMap[elementType]) {
      selectors.push(...semanticMap[elementType]);
    }

    return {
      name: 'Semantic Strategy',
      priority: 2,
      selectors
    };
  }

  private getTextStrategy(originalSelector: string): HealingStrategy {
    const selectors: string[] = [];
    const identifier = this.extractIdentifier(originalSelector);
    
    if (identifier) {
      // Convert camelCase/kebab-case to readable text
      const readableText = identifier
        .replace(/([A-Z])/g, ' $1')
        .replace(/[-_]/g, ' ')
        .trim()
        .toLowerCase();

      selectors.push(`:contains("${readableText}")`);
      selectors.push(`:contains("${identifier}")`);
      
      // Try common button/link text variations
      const commonVariations = [
        readableText,
        this.capitalizeFirst(readableText),
        readableText.toUpperCase(),
        identifier
      ];

      commonVariations.forEach(variation => {
        selectors.push(`button:contains("${variation}")`);
        selectors.push(`a:contains("${variation}")`);
        selectors.push(`[aria-label="${variation}"]`);
        selectors.push(`[title="${variation}"]`);
      });
    }

    return {
      name: 'Text Strategy',
      priority: 3,
      selectors
    };
  }

  private getStructuralStrategy(originalSelector: string): HealingStrategy {
    const selectors: string[] = [];
    
    // Try common structural patterns
    if (originalSelector.includes('form')) {
      selectors.push('form input', 'form button', 'form select', 'form textarea');
    }
    
    if (originalSelector.includes('nav') || originalSelector.includes('menu')) {
      selectors.push('nav a', 'nav button', '[role="navigation"] a', '[role="menuitem"]');
    }
    
    if (originalSelector.includes('table')) {
      selectors.push('table td', 'table th', 'table button', 'table a');
    }

    // Position-based selectors (use with caution)
    if (this.config.sensitivity === 'high') {
      selectors.push(':first', ':last', ':nth-child(1)', ':nth-child(2)');
    }

    return {
      name: 'Structural Strategy',
      priority: 4,
      selectors
    };
  }

  private getRoleStrategy(elementType?: string): HealingStrategy {
    const selectors: string[] = [];
    
    const roleMap: Record<string, string[]> = {
      'button': ['[role="button"]'],
      'input': ['[role="textbox"]', '[role="searchbox"]'],
      'link': ['[role="link"]'],
      'select': ['[role="combobox"]', '[role="listbox"]'],
      'text': ['[role="text"]', '[role="heading"]'],
      'container': ['[role="main"]', '[role="region"]', '[role="section"]']
    };

    if (elementType && roleMap[elementType]) {
      selectors.push(...roleMap[elementType]);
    }

    // Common ARIA roles
    selectors.push('[role="banner"]', '[role="navigation"]', '[role="main"]', '[role="complementary"]', '[role="contentinfo"]');

    return {
      name: 'Role Strategy',
      priority: 5,
      selectors
    };
  }

  private getFuzzyMatchingStrategy(originalSelector: string): HealingStrategy {
    const selectors: string[] = [];
    const identifier = this.extractIdentifier(originalSelector);
    
    if (identifier && identifier.length > 3) {
      // Try partial matches
      const partialId = identifier.substring(0, Math.floor(identifier.length / 2));
      selectors.push(`[id*="${partialId}"]`);
      selectors.push(`[class*="${partialId}"]`);
      selectors.push(`[data-testid*="${partialId}"]`);
      
      // Try without special characters
      const cleanId = identifier.replace(/[^a-zA-Z0-9]/g, '');
      if (cleanId !== identifier) {
        selectors.push(`[id*="${cleanId}"]`);
        selectors.push(`[class*="${cleanId}"]`);
      }
    }

    return {
      name: 'Fuzzy Matching Strategy',
      priority: 6,
      selectors
    };
  }

  private filterStrategiesBySensitivity(strategies: HealingStrategy[]): HealingStrategy[] {
    const maxPriority = this.getSensitivityMaxPriority();
    return strategies
      .filter(strategy => strategy.priority <= maxPriority)
      .sort((a, b) => a.priority - b.priority);
  }

  private getSensitivityMaxPriority(): number {
    switch (this.config.sensitivity) {
      case 'low': return 2;
      case 'medium': return 4;
      case 'high': return 6;
      default: return 4;
    }
  }

  private extractIdentifier(selector: string): string | null {
    // Extract ID
    const idMatch = selector.match(/#([^.\s\[]+)/);
    if (idMatch) return idMatch[1];
    
    // Extract class
    const classMatch = selector.match(/\.([^#\s\[]+)/);
    if (classMatch) return classMatch[1];
    
    // Extract attribute value
    const attrMatch = selector.match(/\[[\w-]+="([^"]+)"\]/);
    if (attrMatch) return attrMatch[1];
    
    // Extract contains text
    const containsMatch = selector.match(/:contains\("([^"]+)"\)/);
    if (containsMatch) return containsMatch[1];
    
    return null;
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private getRetryDelay(attempt: number): number {
    // Exponential backoff with jitter
    const baseDelay = 1000;
    const maxDelay = 5000;
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    const jitter = Math.random() * 0.1 * delay;
    return delay + jitter;
  }

  private logHealingAction(log: HealingLog): void {
    this.healingLogs.push(log);
    
    // Save to file via task
    cy.task('updateLocator', {
      selector: log.oldSelector,
      newSelector: log.newSelector,
      testFile: log.testFile
    }, { failOnError: false });
  }

  private suggestSelectorUpdate(oldSelector: string, newSelector: string, strategy: string): void {
    cy.task('log', `
╔══════════════════════════════════════════════════════════════════╗
║                        AUTO-HEALING SUGGESTION                   ║
╠══════════════════════════════════════════════════════════════════╣
║ Original selector: ${oldSelector.padEnd(43)} ║
║ Working selector:  ${newSelector.padEnd(43)} ║
║ Strategy used:     ${strategy.padEnd(43)} ║
║ File:             ${Cypress.spec.relative.padEnd(44)} ║
╠══════════════════════════════════════════════════════════════════╣
║ Consider updating your test to use the working selector for      ║
║ better reliability and performance.                              ║
╚══════════════════════════════════════════════════════════════════╝
    `);
  }

  public getHealingReport(): HealingLog[] {
    return [...this.healingLogs];
  }

  public clearHealingLogs(): void {
    this.healingLogs = [];
  }

  public static generateHealingReport(): Cypress.Chainable<any> {
    const instance = AutoHealing.getInstance();
    const report = {
      timestamp: new Date().toISOString(),
      testRun: Cypress.spec.name,
      totalHealingAttempts: instance.healingLogs.length,
      successfulHealings: instance.healingLogs.filter(log => log.action === 'element_found').length,
      failedHealings: instance.healingLogs.filter(log => log.action === 'healing_failed').length,
      healingsByStrategy: instance.getHealingsByStrategy(),
      logs: instance.healingLogs
    };

    return cy.writeFile(instance.config.reportPath, report);
  }

  private getHealingsByStrategy(): Record<string, number> {
    const strategies: Record<string, number> = {};
    
    this.healingLogs.forEach(log => {
      if (log.action === 'element_found') {
        // This would need to be enhanced to track which strategy was used
        strategies['unknown'] = (strategies['unknown'] || 0) + 1;
      }
    });
    
    return strategies;
  }
}

interface HealingStrategy {
  name: string;
  priority: number;
  selectors: string[];
}

// Utility functions for use in tests
export const healingUtils = {
  enableHealing: (): void => {
    Cypress.env('autoHealing', { ...Cypress.env('autoHealing'), enabled: true });
  },
  
  disableHealing: (): void => {
    Cypress.env('autoHealing', { ...Cypress.env('autoHealing'), enabled: false });
  },
  
  setSensitivity: (level: 'low' | 'medium' | 'high'): void => {
    Cypress.env('autoHealing', { ...Cypress.env('autoHealing'), sensitivity: level });
  },
  
  getHealingStats: (): Cypress.Chainable<any> => {
    return cy.readFile(Cypress.env('autoHealing')?.reportPath || 'reports/auto-healing.json', { failOnError: false });
  }
};