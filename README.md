# Cypress Automation Framework

An enterprise-grade Cypress automation framework with advanced features including auto-healing, visual testing, multi-platform support, and comprehensive reporting.

## 🚀 Features

### Core Capabilities
- **Page Object Model (POM)** - Structured, maintainable test architecture
- **Auto-Healing** - Automatic adaptation to UI changes with multiple locator strategies
- **Visual Testing** - Screenshot comparison and visual regression detection
- **Multi-Platform Support** - Cross-browser and responsive testing
- **Comprehensive Reporting** - Allure integration with detailed test insights
- **Test Classification** - Tag-based test organization and execution
- **CI/CD Integration** - GitHub Actions workflows with parallel execution
- **Docker Support** - Containerized testing environment

### Advanced Features
- **API-UI Integration Testing** - End-to-end workflow validation
- **Performance Monitoring** - Built-in performance metrics collection
- **Real-time Reporting** - Live test execution dashboards
- **Smart Retry Logic** - Intelligent test retry mechanisms
- **Environment Management** - Multi-environment configuration support

## 📋 Prerequisites

- Node.js 18+ 
- npm 8+
- Docker (optional, for containerized testing)
- Git

## 🛠️ Installation

### Local Setup

```bash
# Clone the repository
git clone <repository-url>
cd cypress-automation-framework

# Install dependencies
npm install

# Install Cypress binary
npx cypress install

# Verify installation
npx cypress verify
```

### Docker Setup

```bash
# Build Docker images
./docker/docker-run.sh build

# Set up complete testing environment
./docker/docker-run.sh setup
```

## 🚦 Quick Start

### Running Tests Locally

```bash
# Open Cypress Test Runner (GUI)
npm run cy:open

# Run all tests headlessly
npm run cy:run

# Run specific test suites
npm run cy:run:smoke
npm run cy:run:regression
npm run cy:run:integration
npm run cy:run:visual

# Run tests with specific browser
npm run cy:run -- --browser firefox
```

### Running Tests with Docker

```bash
# Run smoke tests
./docker/docker-run.sh run local chrome smoke

# Run all tests in parallel
./docker/docker-run.sh parallel staging all regression

# Open Cypress GUI in Docker
./docker/docker-run.sh open local
```

## 📁 Project Structure

```
Cypress-framework/
├── src/
│   ├── pages/              # Page Object Models
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   └── DashboardPage.ts
│   ├── keywords/           # Reusable action keywords
│   │   ├── UIKeywords.ts
│   │   └── APIKeywords.ts
│   ├── utils/              # Utility functions
│   │   ├── AutoHealing.ts
│   │   ├── VisualTesting.ts
│   │   ├── ReportingUtils.ts
│   │   └── TestClassification.ts
│   ├── config/             # Configuration files
│   │   └── PlatformConfig.ts
│   └── types/              # TypeScript type definitions
│       └── index.ts
├── tests/
│   ├── smoke/              # Smoke tests
│   ├── regression/         # Regression tests
│   ├── integration/        # Integration tests
│   └── visual/             # Visual regression tests
├── cypress/
│   ├── support/            # Cypress support files
│   ├── fixtures/           # Test fixtures and data
│   ├── screenshots/        # Screenshot storage
│   └── videos/             # Video recordings
├── configs/                # Environment configurations
├── reports/                # Test reports output
├── docker/                 # Docker configurations
├── .github/workflows/      # CI/CD workflows
└── docs/                   # Documentation
```

## 🔧 Configuration

### Environment Configuration

Configure different environments in `configs/environments.json`:

```json
{
  "dev": {
    "baseUrl": "https://dev.example.com",
    "apiUrl": "https://api-dev.example.com",
    "users": {
      "admin": {
        "username": "admin@dev.example.com",
        "password": "devPassword123"
      }
    }
  }
}
```

### Cypress Configuration

Main configuration in `cypress.config.ts`:

```typescript
export default defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL || 'https://example.com',
    viewportWidth: 1280,
    viewportHeight: 720,
    env: {
      autoHealing: {
        enabled: true,
        sensitivity: 'medium'
      },
      visualTesting: {
        enabled: true,
        threshold: 0.1
      }
    }
  }
});
```

## ✨ Key Features Usage

### Auto-Healing

The framework automatically tries alternative locators when elements are not found:

```typescript
// Will automatically try fallback strategies if primary selector fails
cy.getWithHealing('#primary-selector');
cy.clickWithHealing('.button-class');
```

### Visual Testing

Capture and compare screenshots for visual regression testing:

```typescript
// Compare full page
VisualTesting.compareFullPage('homepage');

// Compare specific element
VisualTesting.compareElement('#header', 'header-component');

// Compare across multiple viewports
VisualTesting.compareResponsive('login-page', [
  { width: 375, height: 667, name: 'mobile' },
  { width: 1280, height: 720, name: 'desktop' }
]);
```

### Test Classification

Organize tests with tags and metadata:

```typescript
// Classify test as smoke test
TestClassification.categorizeAsSmokeTest('login-test', {
  tags: ['smoke', 'authentication', 'critical'],
  priority: 'critical',
  author: 'QA Team'
});

// Run only smoke tests
testExecutionHelpers.runSmokeTests();
```

### Page Object Model

Create maintainable page objects:

```typescript
export class LoginPage extends BasePage {
  constructor() {
    super('/login', {
      usernameInput: { selector: '#username', name: 'Username Input', type: 'input' },
      passwordInput: { selector: '#password', name: 'Password Input', type: 'input' },
      loginButton: { selector: '[data-testid="login-btn"]', name: 'Login Button', type: 'button' }
    });
  }

  login(username: string, password: string): void {
    this.typeInElement('usernameInput', username);
    this.typeInElement('passwordInput', password);
    this.clickElement('loginButton');
  }
}
```

## 📊 Reporting

### Allure Reports

Generate comprehensive Allure reports:

```bash
# Generate and open Allure report
npm run report:allure

# Using Docker
./docker/docker-run.sh reports
```

### Custom Reports

The framework generates multiple report formats:
- HTML reports with screenshots and videos
- JSON reports for CI/CD integration
- Visual testing reports with diff images
- Performance metrics reports

## 🐳 Docker Usage

### Available Services

The Docker setup includes multiple services for comprehensive testing:

```bash
# Start application with database
docker-compose --profile app --profile database up

# Run tests with Selenium Grid
docker-compose --profile selenium up

# Start Allure reporting service
docker-compose --profile reports up

# Performance monitoring with Grafana
docker-compose --profile monitoring up
```

### Docker Commands

```bash
# Build all images
./docker/docker-run.sh build

# Run tests in different environments
./docker/docker-run.sh run staging chrome regression

# View logs
./docker/docker-run.sh logs cypress-framework

# Access container shell
./docker/docker-run.sh shell cypress-framework

# Clean up containers and volumes
./docker/docker-run.sh clean
```

## 🔄 CI/CD Integration

### GitHub Actions

The framework includes comprehensive GitHub Actions workflows:

- **Smoke Tests** - Run on every push/PR
- **Regression Tests** - Parallel execution across browsers
- **Visual Tests** - With baseline management
- **Cross-browser Tests** - Comprehensive browser/device matrix
- **Performance Tests** - Automated performance monitoring

### Environment Variables

Set up these secrets in your GitHub repository:

```bash
BASE_URL_DEV=https://dev.example.com
BASE_URL_STAGING=https://staging.example.com
BASE_URL_PROD=https://example.com
CYPRESS_RECORD_KEY=your-cypress-dashboard-key
SLACK_WEBHOOK_URL=your-slack-webhook-url
```

### Workflow Dispatch

Trigger tests manually with parameters:

```bash
# Via GitHub UI or API
POST /repos/owner/repo/actions/workflows/cypress.yml/dispatches
{
  "ref": "main",
  "inputs": {
    "environment": "staging",
    "test_suite": "regression",
    "browser": "chrome"
  }
}
```

## 🧪 Writing Tests

### Test Structure

Follow this structure for consistent test organization:

```typescript
describe('Feature Name', () => {
  let pageObject: PageClass;

  beforeEach(() => {
    pageObject = new PageClass();
    ReportingUtils.startTestTimer();
    ReportingUtils.addFeature('Feature Name');
  });

  it('should do something', () => {
    // Test classification
    TestClassification.categorizeAsSmokeTest('test-id', {
      tags: ['smoke', 'feature'],
      priority: 'high'
    });

    // Test steps
    ReportingUtils.step('Step 1', () => {
      // Test actions
    });

    ReportingUtils.step('Step 2', () => {
      // Assertions
    });
  });
});
```

### Best Practices

1. **Use Page Objects** - Keep selectors and actions in page classes
2. **Add Classifications** - Tag tests for better organization
3. **Include Reporting** - Add steps and attachments for better reports
4. **Handle Waits** - Use smart waiting strategies
5. **Visual Testing** - Include visual checks for UI-heavy features
6. **API Integration** - Combine API and UI testing for complete coverage

## 🔍 Debugging

### Local Debugging

```bash
# Run with headed browser for debugging
npx cypress run --headed --browser chrome

# Open specific test in Test Runner
npx cypress open --spec "tests/smoke/login.spec.ts"

# Enable debug mode
DEBUG=cypress:* npm run cy:run
```

### Docker Debugging

```bash
# Access running container
./docker/docker-run.sh shell cypress-framework

# View real-time logs
./docker/docker-run.sh logs cypress-framework

# Monitor resource usage
./docker/docker-run.sh monitor
```

## 📈 Performance Monitoring

### Built-in Metrics

The framework automatically collects:
- Page load times
- API response times
- Test execution duration
- Resource usage metrics

### Performance Tests

```typescript
// Measure page performance
ReportingUtils.capturePerformanceMetrics().then((metrics) => {
  expect(metrics.loadTime).to.be.lessThan(3000);
});

// API performance testing
APIKeywords.measureApiPerformance('/api/endpoint', 5).then((results) => {
  expect(results.average).to.be.lessThan(500);
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Use conventional commit messages
- Ensure all tests pass in CI/CD

## 📚 Documentation

- [Auto-Healing Guide](docs/auto-healing.md)
- [Visual Testing Guide](docs/visual-testing.md)
- [API Testing Guide](docs/api-testing.md)
- [CI/CD Setup Guide](docs/ci-cd-setup.md)
- [Docker Guide](docs/docker-guide.md)

## 🐛 Troubleshooting

### Common Issues

1. **Cypress Binary Issues**
   ```bash
   npx cypress cache clear
   npx cypress install --force
   ```

2. **Docker Permission Issues**
   ```bash
   sudo chown -R $USER:$USER cypress/
   ```

3. **Visual Test Failures**
   ```bash
   # Update baselines after UI changes
   npm run cy:run -- --env updateVisualBaselines=true
   ```

4. **Auto-healing Not Working**
   - Check selector specificity
   - Verify auto-healing is enabled in config
   - Review healing logs in reports

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Acknowledgments

- Cypress team for the amazing testing framework
- Allure for comprehensive reporting capabilities
- Docker for containerization support
- GitHub Actions for CI/CD integration

---

For more information, please refer to the [documentation](docs/) or create an issue in the repository.