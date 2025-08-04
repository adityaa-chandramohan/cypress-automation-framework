export class ReportingUtils {
  private static testStartTime: number;
  private static testMetrics: TestMetrics = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    totalDuration: 0,
    averageDuration: 0
  };

  // Allure reporting methods
  static addEpic(epic: string): void {
    if ((cy as any).allure) {
      (cy as any).allure().epic(epic);
    }
    cy.addTestLog(`Epic: ${epic}`, 'info');
  }

  static addFeature(feature: string): void {
    if ((cy as any).allure) {
      (cy as any).allure().feature(feature);
    }
    cy.addTestLog(`Feature: ${feature}`, 'info');
  }

  static addStory(story: string): void {
    if ((cy as any).allure) {
      (cy as any).allure().story(story);
    }
    cy.addTestLog(`Story: ${story}`, 'info');
  }

  static addSeverity(severity: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial'): void {
    if ((cy as any).allure) {
      (cy as any).allure().severity(severity);
    }
    cy.addTestLog(`Severity: ${severity}`, 'info');
  }

  static addTag(tag: string): void {
    if ((cy as any).allure) {
      (cy as any).allure().tag(tag);
    }
    cy.addTestLog(`Tag: ${tag}`, 'info');
  }

  static addTags(tags: string[]): void {
    if ((cy as any).allure) {
      tags.forEach(tag => {
        (cy as any).allure().tag(tag);
      });
    }
    cy.addTestLog(`Tags: ${tags.join(', ')}`, 'info');
  }

  static addOwner(owner: string): void {
    if ((cy as any).allure) {
      (cy as any).allure().owner(owner);
    }
    cy.addTestLog(`Owner: ${owner}`, 'info');
  }

  static addDescription(description: string): void {
    if ((cy as any).allure) {
      (cy as any).allure().description(description);
    }
    cy.addTestLog(`Description: ${description}`, 'info');
  }

  static addTestId(testId: string): void {
    if ((cy as any).allure) {
      (cy as any).allure().testID(testId);
    }
    cy.addTestLog(`Test ID: ${testId}`, 'info');
  }

  static addIssue(issue: string): void {
    if ((cy as any).allure) {
      (cy as any).allure().issue(issue);
    }
    cy.addTestLog(`Issue: ${issue}`, 'info');
  }

  static addLink(url: string, name?: string, type?: string): void {
    if ((cy as any).allure) {
      (cy as any).allure().link(url, name, type);
    }
    cy.addTestLog(`Link: ${name || url}`, 'info');
  }

  // Step reporting
  static step(stepName: string, stepFunction?: () => void): Cypress.Chainable<void> {
    cy.addTestLog(`Step: ${stepName}`, 'info');
    
    if ((cy as any).allure) {
      if (stepFunction) {
        return (cy as any).allure().step(stepName, stepFunction);
      } else {
        return (cy as any).allure().step(stepName);
      }
    } else {
      if (stepFunction) {
        stepFunction();
      }
      return cy.wrap(null);
    }
  }

  static startStep(stepName: string): void {
    if ((cy as any).allure) {
      (cy as any).allure().startStep(stepName);
    }
    cy.addTestLog(`Started step: ${stepName}`, 'info');
  }

  static endStep(): void {
    if ((cy as any).allure) {
      (cy as any).allure().endStep();
    }
    cy.addTestLog('Ended step', 'info');
  }

  // Attachment methods
  static attachScreenshot(name: string, screenshotPath?: string): void {
    if (screenshotPath) {
      if ((cy as any).allure) {
        (cy as any).allure().attachment(name, screenshotPath, 'image/png');
      }
    } else {
      cy.screenshot(name).then(() => {
        if ((cy as any).allure) {
          (cy as any).allure().attachment(name, `cypress/screenshots/${name}.png`, 'image/png');
        }
      });
    }
    cy.addTestLog(`Screenshot attached: ${name}`, 'info');
  }

  static attachVideo(name: string, videoPath: string): void {
    if ((cy as any).allure) {
      (cy as any).allure().attachment(name, videoPath, 'video/mp4');
    }
    cy.addTestLog(`Video attached: ${name}`, 'info');
  }

  static attachFile(name: string, filePath: string, mimeType: string): void {
    if ((cy as any).allure) {
      (cy as any).allure().attachment(name, filePath, mimeType);
    }
    cy.addTestLog(`File attached: ${name}`, 'info');
  }

  static attachText(name: string, text: string): void {
    const tempFile = `temp/${name}-${Date.now()}.txt`;
    cy.writeFile(tempFile, text).then(() => {
      if ((cy as any).allure) {
        (cy as any).allure().attachment(name, tempFile, 'text/plain');
      }
    });
    cy.addTestLog(`Text attached: ${name}`, 'info');
  }

  static attachJson(name: string, jsonData: any): void {
    const tempFile = `temp/${name}-${Date.now()}.json`;
    cy.writeFile(tempFile, JSON.stringify(jsonData, null, 2)).then(() => {
      if ((cy as any).allure) {
        (cy as any).allure().attachment(name, tempFile, 'application/json');
      }
    });
    cy.addTestLog(`JSON attached: ${name}`, 'info');
  }

  static attachApiResponse(name: string, response: any): void {
    const responseData = {
      status: response.status,
      headers: response.headers,
      body: response.body,
      duration: response.duration,
      timestamp: new Date().toISOString()
    };
    
    this.attachJson(`API Response - ${name}`, responseData);
  }

  static attachBrowserLogs(name: string = 'Browser Logs'): void {
    cy.window().then((win) => {
      // Get console logs (this would need to be implemented with proper logging capture)
      const logs = win.console || [];
      this.attachJson(name, { logs: 'Browser logs would be captured here' });
    });
  }

  static attachNetworkLogs(name: string = 'Network Logs'): void {
    // This would integrate with Cypress network interception
    cy.get('@networkRequests', { failOnError: false }).then((requests) => {
      if (requests) {
        this.attachJson(name, requests);
      }
    });
  }

  // Test metrics and timing
  static startTestTimer(): void {
    this.testStartTime = Date.now();
  }

  static endTestTimer(): number {
    const duration = Date.now() - this.testStartTime;
    this.testMetrics.totalDuration += duration;
    cy.addTestLog(`Test duration: ${duration}ms`, 'info');
    return duration;
  }

  static recordTestResult(status: 'passed' | 'failed' | 'skipped'): void {
    this.testMetrics.totalTests++;
    
    switch (status) {
      case 'passed':
        this.testMetrics.passedTests++;
        break;
      case 'failed':
        this.testMetrics.failedTests++;
        break;
      case 'skipped':
        this.testMetrics.skippedTests++;
        break;
    }
    
    this.testMetrics.averageDuration = this.testMetrics.totalDuration / this.testMetrics.totalTests;
  }

  static getTestMetrics(): TestMetrics {
    return { ...this.testMetrics };
  }

  // Environment information
  static attachEnvironmentInfo(): void {
    const envInfo = {
      browser: Cypress.browser,
      viewport: Cypress.config('viewportWidth') + 'x' + Cypress.config('viewportHeight'),
      baseUrl: Cypress.config('baseUrl'),
      cypressVersion: Cypress.version,
      nodeVersion: Cypress.platform,
      timestamp: new Date().toISOString(),
      testEnvironment: Cypress.env('environment') || 'unknown'
    };
    
    this.attachJson('Environment Info', envInfo);
  }

  // Custom reporting
  static generateCustomReport(reportData: CustomReportData): Cypress.Chainable<void> {
    const report = {
      ...reportData,
      timestamp: new Date().toISOString(),
      testMetrics: this.getTestMetrics(),
      environment: {
        browser: Cypress.browser.name,
        cypressVersion: Cypress.version
      }
    };
    
    const reportPath = `reports/custom-report-${Date.now()}.json`;
    
    return cy.writeFile(reportPath, report).then(() => {
      cy.addTestLog(`Custom report generated: ${reportPath}`, 'info');
    });
  }

  // HTML Report generation
  static generateHtmlReport(): Cypress.Chainable<void> {
    const reportData = {
      title: 'Cypress Test Results',
      timestamp: new Date().toISOString(),
      metrics: this.getTestMetrics(),
      environment: {
        browser: Cypress.browser,
        viewport: Cypress.config('viewportWidth') + 'x' + Cypress.config('viewportHeight'),
        baseUrl: Cypress.config('baseUrl')
      }
    };

    const htmlContent = this.generateHtmlContent(reportData);
    const reportPath = `reports/html-report-${Date.now()}.html`;
    
    return cy.writeFile(reportPath, htmlContent).then(() => {
      cy.addTestLog(`HTML report generated: ${reportPath}`, 'info');
    });
  }

  private static generateHtmlContent(data: any): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background-color: #f5f5f5; 
        }
        .header { 
            background-color: #4CAF50; 
            color: white; 
            padding: 20px; 
            border-radius: 5px; 
            margin-bottom: 20px; 
        }
        .metrics { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin-bottom: 20px; 
        }
        .metric-card { 
            background: white; 
            padding: 20px; 
            border-radius: 5px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
            text-align: center; 
        }
        .metric-value { 
            font-size: 2em; 
            font-weight: bold; 
            color: #333; 
        }
        .metric-label { 
            color: #666; 
            margin-top: 10px; 
        }
        .environment { 
            background: white; 
            padding: 20px; 
            border-radius: 5px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        }
        .pass { color: #4CAF50; }
        .fail { color: #f44336; }
        .skip { color: #ff9800; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${data.title}</h1>
        <p>Generated on: ${new Date(data.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="metrics">
        <div class="metric-card">
            <div class="metric-value">${data.metrics.totalTests}</div>
            <div class="metric-label">Total Tests</div>
        </div>
        <div class="metric-card">
            <div class="metric-value pass">${data.metrics.passedTests}</div>
            <div class="metric-label">Passed</div>
        </div>
        <div class="metric-card">
            <div class="metric-value fail">${data.metrics.failedTests}</div>
            <div class="metric-label">Failed</div>
        </div>
        <div class="metric-card">
            <div class="metric-value skip">${data.metrics.skippedTests}</div>
            <div class="metric-label">Skipped</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${Math.round(data.metrics.averageDuration)}ms</div>
            <div class="metric-label">Avg Duration</div>
        </div>
    </div>
    
    <div class="environment">
        <h2>Environment Information</h2>
        <p><strong>Browser:</strong> ${data.environment.browser.name} ${data.environment.browser.version}</p>
        <p><strong>Viewport:</strong> ${data.environment.viewport}</p>
        <p><strong>Base URL:</strong> ${data.environment.baseUrl}</p>
    </div>
</body>
</html>
    `;
  }

  // Dashboard integration
  static sendToDashboard(dashboardUrl: string, reportData: any): Cypress.Chainable<void> {
    if (!dashboardUrl) {
      cy.addTestLog('Dashboard URL not configured', 'warn');
      return cy.wrap(null);
    }

    const payload = {
      ...reportData,
      timestamp: new Date().toISOString(),
      testRun: Cypress.spec.name,
      metrics: this.getTestMetrics()
    };

    return cy.request({
      method: 'POST',
      url: dashboardUrl,
      body: payload,
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200) {
        cy.addTestLog('Results sent to dashboard successfully', 'info');
      } else {
        cy.addTestLog(`Failed to send to dashboard: ${response.status}`, 'warn');
      }
    });
  }

  // Slack integration
  static sendToSlack(webhookUrl: string, message: SlackMessage): Cypress.Chainable<void> {
    if (!webhookUrl) {
      cy.addTestLog('Slack webhook URL not configured', 'warn');
      return cy.wrap(null);
    }

    const metrics = this.getTestMetrics();
    const status = metrics.failedTests > 0 ? 'failed' : 'passed';
    const color = status === 'passed' ? 'good' : 'danger';

    const slackPayload = {
      username: 'Cypress Test Bot',
      icon_emoji: ':robot_face:',
      attachments: [
        {
          color: color,
          title: message.title || 'Test Results',
          text: message.text || `Test run completed with ${metrics.passedTests} passed, ${metrics.failedTests} failed`,
          fields: [
            {
              title: 'Total Tests',
              value: metrics.totalTests.toString(),
              short: true
            },
            {
              title: 'Passed',
              value: metrics.passedTests.toString(),
              short: true
            },
            {
              title: 'Failed',
              value: metrics.failedTests.toString(),
              short: true
            },
            {
              title: 'Duration',
              value: `${Math.round(metrics.totalDuration / 1000)}s`,
              short: true
            }
          ],
          footer: 'Cypress Framework',
          ts: Math.floor(Date.now() / 1000)
        }
      ]
    };

    return cy.request({
      method: 'POST',
      url: webhookUrl,
      body: slackPayload,
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200) {
        cy.addTestLog('Results sent to Slack successfully', 'info');
      } else {
        cy.addTestLog(`Failed to send to Slack: ${response.status}`, 'warn');
      }
    });
  }

  // Email reporting
  static generateEmailReport(emailConfig: EmailConfig): Cypress.Chainable<void> {
    const metrics = this.getTestMetrics();
    const status = metrics.failedTests > 0 ? 'FAILED' : 'PASSED';
    
    const emailBody = `
      <h2>Test Results Summary</h2>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>Total Tests:</strong> ${metrics.totalTests}</p>
      <p><strong>Passed:</strong> ${metrics.passedTests}</p>
      <p><strong>Failed:</strong> ${metrics.failedTests}</p>
      <p><strong>Skipped:</strong> ${metrics.skippedTests}</p>
      <p><strong>Duration:</strong> ${Math.round(metrics.totalDuration / 1000)} seconds</p>
      <p><strong>Test Suite:</strong> ${Cypress.spec.name}</p>
      <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
    `;

    const emailData = {
      to: emailConfig.recipients,
      subject: `Test Results - ${status} - ${Cypress.spec.name}`,
      body: emailBody,
      attachments: emailConfig.attachments || []
    };

    return cy.writeFile(`reports/email-report-${Date.now()}.json`, emailData).then(() => {
      cy.addTestLog('Email report data generated', 'info');
    });
  }

  // Performance metrics
  static capturePerformanceMetrics(): Cypress.Chainable<PerformanceMetrics> {
    return cy.window().then((win) => {
      const navigation = win.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = win.performance.getEntriesByType('paint');
      
      const metrics: PerformanceMetrics = {
        loadTime: navigation.loadEventEnd - navigation.navigationStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        networkTime: navigation.responseEnd - navigation.requestStart,
        serverTime: navigation.responseStart - navigation.requestStart,
        transferTime: navigation.responseEnd - navigation.responseStart,
        domProcessingTime: navigation.domComplete - navigation.responseEnd
      };

      this.attachJson('Performance Metrics', metrics);
      return metrics;
    });
  }

  // Cleanup methods
  static cleanup(): void {
    this.testMetrics = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0,
      averageDuration: 0
    };
  }
}

// Type definitions
interface TestMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  totalDuration: number;
  averageDuration: number;
}

interface CustomReportData {
  title: string;
  description?: string;
  testSuite: string;
  results: any[];
  summary?: any;
}

interface SlackMessage {
  title?: string;
  text?: string;
  channel?: string;
}

interface EmailConfig {
  recipients: string[];
  attachments?: string[];
}

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  networkTime: number;
  serverTime: number;
  transferTime: number;
  domProcessingTime: number;
}

// Utility functions for reporting
export const reportingHelpers = {
  formatDuration: (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  },

  calculatePassRate: (passed: number, total: number): string => {
    return total > 0 ? `${((passed / total) * 100).toFixed(1)}%` : '0%';
  },

  getStatusColor: (status: string): string => {
    switch (status.toLowerCase()) {
      case 'passed': return '#4CAF50';
      case 'failed': return '#f44336';
      case 'skipped': return '#ff9800';
      default: return '#666';
    }
  },

  generateSummary: (metrics: TestMetrics): string => {
    const passRate = reportingHelpers.calculatePassRate(metrics.passedTests, metrics.totalTests);
    return `${metrics.totalTests} tests, ${metrics.passedTests} passed (${passRate}), ${metrics.failedTests} failed, ${metrics.skippedTests} skipped`;
  }
};