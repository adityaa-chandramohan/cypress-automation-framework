import { TestMetadata } from '../types';

export class TestClassification {
  private static instance: TestClassification;
  private testRegistry: Map<string, TestMetadata> = new Map();
  private tagFilters: string[] = [];
  private priorityFilters: string[] = [];

  private constructor() {}

  public static getInstance(): TestClassification {
    if (!TestClassification.instance) {
      TestClassification.instance = new TestClassification();
    }
    return TestClassification.instance;
  }

  // Test registration and metadata
  static registerTest(testId: string, metadata: TestMetadata): void {
    const instance = TestClassification.getInstance();
    instance.testRegistry.set(testId, metadata);
    
    // Apply metadata to current test
    instance.applyTestMetadata(metadata);
  }

  static getTestMetadata(testId: string): TestMetadata | undefined {
    const instance = TestClassification.getInstance();
    return instance.testRegistry.get(testId);
  }

  private applyTestMetadata(metadata: TestMetadata): void {
    // Apply tags to Allure
    if (cy.allure && metadata.tags) {
      metadata.tags.forEach(tag => {
        (cy as any).allure().tag(tag);
      });
    }

    // Apply priority
    if (cy.allure && metadata.priority) {
      const severityMap = {
        low: 'minor',
        medium: 'normal', 
        high: 'normal',
        critical: 'critical'
      };
      (cy as any).allure().severity(severityMap[metadata.priority] as any);
    }

    // Apply author
    if (cy.allure && metadata.author) {
      (cy as any).allure().owner(metadata.author);
    }

    // Apply description
    if (cy.allure && metadata.description) {
      (cy as any).allure().description(metadata.description);
    }

    // Apply test ID
    if (cy.allure && metadata.testId) {
      (cy as any).allure().testID(metadata.testId);
    }
  }

  // Tag-based filtering
  static setTagFilter(tags: string[]): void {
    const instance = TestClassification.getInstance();
    instance.tagFilters = tags;
    cy.addTestLog(`Tag filters set: ${tags.join(', ')}`, 'info');
  }

  static setPriorityFilter(priorities: string[]): void {
    const instance = TestClassification.getInstance();
    instance.priorityFilters = priorities;
    cy.addTestLog(`Priority filters set: ${priorities.join(', ')}`, 'info');
  }

  static shouldRunTest(testId: string): boolean {
    const instance = TestClassification.getInstance();
    const metadata = instance.testRegistry.get(testId);
    
    if (!metadata) {
      return true; // Run unregistered tests by default
    }

    // Check tag filters
    if (instance.tagFilters.length > 0) {
      const hasMatchingTag = metadata.tags.some(tag => 
        instance.tagFilters.includes(tag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    // Check priority filters
    if (instance.priorityFilters.length > 0) {
      if (!instance.priorityFilters.includes(metadata.priority)) {
        return false;
      }
    }

    return true;
  }

  // Test categorization helpers
  static categorizeAsSmokeTest(testId: string, metadata: Partial<TestMetadata> = {}): void {
    const smokeMetadata: TestMetadata = {
      tags: ['smoke', 'critical-path', ...(metadata.tags || [])],
      priority: 'critical',
      author: metadata.author || 'unknown',
      description: metadata.description || 'Smoke test to verify critical functionality',
      testId
    };
    
    this.registerTest(testId, smokeMetadata);
  }

  static categorizeAsRegressionTest(testId: string, metadata: Partial<TestMetadata> = {}): void {
    const regressionMetadata: TestMetadata = {
      tags: ['regression', 'full-suite', ...(metadata.tags || [])],
      priority: metadata.priority || 'medium',
      author: metadata.author || 'unknown',
      description: metadata.description || 'Regression test to verify existing functionality',
      testId
    };
    
    this.registerTest(testId, regressionMetadata);
  }

  static categorizeAsIntegrationTest(testId: string, metadata: Partial<TestMetadata> = {}): void {
    const integrationMetadata: TestMetadata = {
      tags: ['integration', 'api', 'end-to-end', ...(metadata.tags || [])],
      priority: metadata.priority || 'high',
      author: metadata.author || 'unknown',
      description: metadata.description || 'Integration test to verify system interactions',
      testId
    };
    
    this.registerTest(testId, integrationMetadata);
  }

  static categorizeAsVisualTest(testId: string, metadata: Partial<TestMetadata> = {}): void {
    const visualMetadata: TestMetadata = {
      tags: ['visual', 'ui', 'regression', ...(metadata.tags || [])],
      priority: metadata.priority || 'medium',
      author: metadata.author || 'unknown',
      description: metadata.description || 'Visual regression test to verify UI appearance',
      testId
    };
    
    this.registerTest(testId, visualMetadata);
  }

  static categorizeAsPerformanceTest(testId: string, metadata: Partial<TestMetadata> = {}): void {
    const performanceMetadata: TestMetadata = {
      tags: ['performance', 'load', 'non-functional', ...(metadata.tags || [])],
      priority: metadata.priority || 'medium',
      author: metadata.author || 'unknown',
      description: metadata.description || 'Performance test to verify system responsiveness',
      testId
    };
    
    this.registerTest(testId, performanceMetadata);
  }

  static categorizeAsSecurityTest(testId: string, metadata: Partial<TestMetadata> = {}): void {
    const securityMetadata: TestMetadata = {
      tags: ['security', 'auth', 'vulnerability', ...(metadata.tags || [])],
      priority: 'high',
      author: metadata.author || 'unknown',
      description: metadata.description || 'Security test to verify system protection',
      testId
    };
    
    this.registerTest(testId, securityMetadata);
  }

  static categorizeAsAccessibilityTest(testId: string, metadata: Partial<TestMetadata> = {}): void {
    const a11yMetadata: TestMetadata = {
      tags: ['accessibility', 'a11y', 'compliance', ...(metadata.tags || [])],
      priority: metadata.priority || 'medium',
      author: metadata.author || 'unknown',
      description: metadata.description || 'Accessibility test to verify WCAG compliance',
      testId
    };
    
    this.registerTest(testId, a11yMetadata);
  }

  // Test suite management
  static createTestSuite(suiteName: string, testIds: string[], metadata: Partial<TestMetadata> = {}): void {
    const suiteMetadata: TestMetadata = {
      tags: [`suite:${suiteName}`, ...(metadata.tags || [])],
      priority: metadata.priority || 'medium',
      author: metadata.author || 'unknown',
      description: metadata.description || `Test suite: ${suiteName}`,
      testId: `suite-${suiteName}`
    };

    testIds.forEach(testId => {
      const existingMetadata = TestClassification.getTestMetadata(testId);
      if (existingMetadata) {
        const updatedMetadata: TestMetadata = {
          ...existingMetadata,
          tags: [...existingMetadata.tags, `suite:${suiteName}`]
        };
        TestClassification.registerTest(testId, updatedMetadata);
      }
    });

    TestClassification.registerTest(`suite-${suiteName}`, suiteMetadata);
  }

  // Environment-specific categorization
  static categorizeForEnvironment(testId: string, environment: string, metadata: Partial<TestMetadata> = {}): void {
    const envMetadata: TestMetadata = {
      tags: [`env:${environment}`, ...(metadata.tags || [])],
      priority: metadata.priority || 'medium',
      author: metadata.author || 'unknown',
      description: metadata.description || `Test for ${environment} environment`,
      testId
    };
    
    this.registerTest(testId, envMetadata);
  }

  // Browser-specific categorization
  static categorizeForBrowser(testId: string, browser: string, metadata: Partial<TestMetadata> = {}): void {
    const browserMetadata: TestMetadata = {
      tags: [`browser:${browser}`, ...(metadata.tags || [])],
      priority: metadata.priority || 'medium',
      author: metadata.author || 'unknown',
      description: metadata.description || `Test for ${browser} browser`,
      testId
    };
    
    this.registerTest(testId, browserMetadata);
  }

  // Device-specific categorization
  static categorizeForDevice(testId: string, device: string, metadata: Partial<TestMetadata> = {}): void {
    const deviceMetadata: TestMetadata = {
      tags: [`device:${device}`, ...(metadata.tags || [])],
      priority: metadata.priority || 'medium',
      author: metadata.author || 'unknown',
      description: metadata.description || `Test for ${device} device`,
      testId
    };
    
    this.registerTest(testId, deviceMetadata);
  }

  // Feature-based categorization
  static categorizeByFeature(testId: string, feature: string, metadata: Partial<TestMetadata> = {}): void {
    const featureMetadata: TestMetadata = {
      tags: [`feature:${feature}`, ...(metadata.tags || [])],
      priority: metadata.priority || 'medium',
      author: metadata.author || 'unknown',
      description: metadata.description || `Test for ${feature} feature`,
      testId
    };
    
    this.registerTest(testId, featureMetadata);
  }

  // Component-based categorization
  static categorizeByComponent(testId: string, component: string, metadata: Partial<TestMetadata> = {}): void {
    const componentMetadata: TestMetadata = {
      tags: [`component:${component}`, ...(metadata.tags || [])],
      priority: metadata.priority || 'medium',
      author: metadata.author || 'unknown',
      description: metadata.description || `Test for ${component} component`,
      testId
    };
    
    this.registerTest(testId, componentMetadata);
  }

  // Query and reporting methods
  static getTestsByTag(tag: string): Map<string, TestMetadata> {
    const instance = TestClassification.getInstance();
    const filteredTests = new Map<string, TestMetadata>();
    
    instance.testRegistry.forEach((metadata, testId) => {
      if (metadata.tags.includes(tag)) {
        filteredTests.set(testId, metadata);
      }
    });
    
    return filteredTests;
  }

  static getTestsByPriority(priority: string): Map<string, TestMetadata> {
    const instance = TestClassification.getInstance();
    const filteredTests = new Map<string, TestMetadata>();
    
    instance.testRegistry.forEach((metadata, testId) => {
      if (metadata.priority === priority) {
        filteredTests.set(testId, metadata);
      }
    });
    
    return filteredTests;
  }

  static getTestsByAuthor(author: string): Map<string, TestMetadata> {
    const instance = TestClassification.getInstance();
    const filteredTests = new Map<string, TestMetadata>();
    
    instance.testRegistry.forEach((metadata, testId) => {
      if (metadata.author === author) {
        filteredTests.set(testId, metadata);
      }
    });
    
    return filteredTests;
  }

  static getAllTags(): string[] {
    const instance = TestClassification.getInstance();
    const allTags = new Set<string>();
    
    instance.testRegistry.forEach(metadata => {
      metadata.tags.forEach(tag => allTags.add(tag));
    });
    
    return Array.from(allTags).sort();
  }

  static getTagStatistics(): Record<string, number> {
    const instance = TestClassification.getInstance();
    const tagStats: Record<string, number> = {};
    
    instance.testRegistry.forEach(metadata => {
      metadata.tags.forEach(tag => {
        tagStats[tag] = (tagStats[tag] || 0) + 1;
      });
    });
    
    return tagStats;
  }

  static getPriorityStatistics(): Record<string, number> {
    const instance = TestClassification.getInstance();
    const priorityStats: Record<string, number> = {};
    
    instance.testRegistry.forEach(metadata => {
      const priority = metadata.priority;
      priorityStats[priority] = (priorityStats[priority] || 0) + 1;
    });
    
    return priorityStats;
  }

  // Report generation
  static generateClassificationReport(): Cypress.Chainable<ClassificationReport> {
    const instance = TestClassification.getInstance();
    
    const report: ClassificationReport = {
      timestamp: new Date().toISOString(),
      totalTests: instance.testRegistry.size,
      tagStatistics: this.getTagStatistics(),
      priorityStatistics: this.getPriorityStatistics(),
      allTags: this.getAllTags(),
      testDetails: Array.from(instance.testRegistry.entries()).map(([testId, metadata]) => ({
        testId,
        ...metadata
      }))
    };
    
    const reportPath = `reports/test-classification-${Date.now()}.json`;
    
    return cy.writeFile(reportPath, report).then(() => {
      cy.addTestLog(`Classification report generated: ${reportPath}`, 'info');
      return report;
    });
  }

  // Cleanup methods
  static clearRegistry(): void {
    const instance = TestClassification.getInstance();
    instance.testRegistry.clear();
    instance.tagFilters = [];
    instance.priorityFilters = [];
  }

  static removeTest(testId: string): boolean {
    const instance = TestClassification.getInstance();
    return instance.testRegistry.delete(testId);
  }
}

// Type definitions
interface ClassificationReport {
  timestamp: string;
  totalTests: number;
  tagStatistics: Record<string, number>;
  priorityStatistics: Record<string, number>;
  allTags: string[];
  testDetails: Array<TestMetadata & { testId: string }>;
}

// Pre-defined tag collections
export const CommonTags = {
  SMOKE: 'smoke',
  REGRESSION: 'regression',
  INTEGRATION: 'integration',
  VISUAL: 'visual',
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  ACCESSIBILITY: 'accessibility',
  API: 'api',
  UI: 'ui',
  CRITICAL_PATH: 'critical-path',
  HAPPY_PATH: 'happy-path',
  ERROR_HANDLING: 'error-handling',
  EDGE_CASE: 'edge-case',
  CROSS_BROWSER: 'cross-browser',
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
  RESPONSIVE: 'responsive'
};

export const CommonPriorities = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Decorator functions for easy test categorization
export const testDecorators = {
  smoke: (testId: string, metadata?: Partial<TestMetadata>) => 
    TestClassification.categorizeAsSmokeTest(testId, metadata),
  
  regression: (testId: string, metadata?: Partial<TestMetadata>) => 
    TestClassification.categorizeAsRegressionTest(testId, metadata),
  
  integration: (testId: string, metadata?: Partial<TestMetadata>) => 
    TestClassification.categorizeAsIntegrationTest(testId, metadata),
  
  visual: (testId: string, metadata?: Partial<TestMetadata>) => 
    TestClassification.categorizeAsVisualTest(testId, metadata),
  
  performance: (testId: string, metadata?: Partial<TestMetadata>) => 
    TestClassification.categorizeAsPerformanceTest(testId, metadata),
  
  security: (testId: string, metadata?: Partial<TestMetadata>) => 
    TestClassification.categorizeAsSecurityTest(testId, metadata),
  
  accessibility: (testId: string, metadata?: Partial<TestMetadata>) => 
    TestClassification.categorizeAsAccessibilityTest(testId, metadata)
};

// Helper functions for test execution
export const testExecutionHelpers = {
  runSmokeTests: () => TestClassification.setTagFilter([CommonTags.SMOKE]),
  runRegressionTests: () => TestClassification.setTagFilter([CommonTags.REGRESSION]),
  runCriticalTests: () => TestClassification.setPriorityFilter([CommonPriorities.CRITICAL]),
  runHighPriorityTests: () => TestClassification.setPriorityFilter([CommonPriorities.CRITICAL, CommonPriorities.HIGH]),
  
  runMobileTests: () => TestClassification.setTagFilter([CommonTags.MOBILE]),
  runDesktopTests: () => TestClassification.setTagFilter([CommonTags.DESKTOP]),
  runCrossBrowserTests: () => TestClassification.setTagFilter([CommonTags.CROSS_BROWSER]),
  
  runFeatureTests: (feature: string) => TestClassification.setTagFilter([`feature:${feature}`]),
  runComponentTests: (component: string) => TestClassification.setTagFilter([`component:${component}`]),
  runEnvironmentTests: (env: string) => TestClassification.setTagFilter([`env:${env}`])
};