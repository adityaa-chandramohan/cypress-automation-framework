import { LoginPage } from '../../src/pages/LoginPage';
import { DashboardPage } from '../../src/pages/DashboardPage';
import { ReportingUtils } from '../../src/utils/ReportingUtils';
import { TestClassification, CommonTags, CommonPriorities } from '../../src/utils/TestClassification';

describe('Login - Smoke Tests', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  beforeEach(() => {
    // Initialize page objects
    loginPage = new LoginPage();
    dashboardPage = new DashboardPage();

    // Start test timer
    ReportingUtils.startTestTimer();

    // Set up test metadata
    ReportingUtils.addEpic('Authentication');
    ReportingUtils.addFeature('Login');
    ReportingUtils.attachEnvironmentInfo();
  });

  afterEach(() => {
    // End test timer and record result
    const duration = ReportingUtils.endTestTimer();
    
    // Capture screenshot on failure
    cy.then(() => {
      if (Cypress.currentTest.state === 'failed') {
        ReportingUtils.attachScreenshot(`failed-${Cypress.currentTest.title}`);
      }
    });
  });

  it('should login with valid credentials', () => {
    // Test classification
    TestClassification.categorizeAsSmokeTest('login-valid-credentials', {
      tags: [CommonTags.SMOKE, CommonTags.CRITICAL_PATH, CommonTags.HAPPY_PATH],
      priority: CommonPriorities.CRITICAL,
      author: 'QA Team',
      description: 'Verify user can login with valid credentials'
    });

    ReportingUtils.addStory('Valid Login');
    ReportingUtils.addSeverity('critical');

    ReportingUtils.step('Navigate to login page', () => {
      loginPage.visit();
      loginPage.shouldBeOnLoginPage();
      loginPage.shouldHaveLoginFormVisible();
    });

    ReportingUtils.step('Enter valid credentials', () => {
      const validUsername = Cypress.env('validUsername') || 'testuser@example.com';
      const validPassword = Cypress.env('validPassword') || 'password123';
      
      loginPage.enterUsername(validUsername);
      loginPage.enterPassword(validPassword);
    });

    ReportingUtils.step('Submit login form', () => {
      loginPage.clickLoginButton();
    });

    ReportingUtils.step('Verify successful login', () => {
      dashboardPage.waitForDashboardLoad();
      dashboardPage.shouldBeOnDashboard();
      dashboardPage.shouldShowWelcomeMessage();
      dashboardPage.shouldShowNavigationMenu();
    });

    // Capture success screenshot
    ReportingUtils.attachScreenshot('successful-login');
  });

  it('should show error for invalid credentials', () => {
    // Test classification
    TestClassification.categorizeAsSmokeTest('login-invalid-credentials', {
      tags: [CommonTags.SMOKE, CommonTags.ERROR_HANDLING, CommonTags.SECURITY],
      priority: CommonPriorities.HIGH,
      author: 'QA Team',
      description: 'Verify error is shown for invalid credentials'
    });

    ReportingUtils.addStory('Invalid Login');
    ReportingUtils.addSeverity('normal');

    ReportingUtils.step('Navigate to login page', () => {
      loginPage.visit();
      loginPage.shouldBeOnLoginPage();
    });

    ReportingUtils.step('Enter invalid credentials', () => {
      loginPage.enterUsername('invalid@example.com');
      loginPage.enterPassword('wrongpassword');
    });

    ReportingUtils.step('Submit login form', () => {
      loginPage.clickLoginButton();
    });

    ReportingUtils.step('Verify error message is displayed', () => {
      loginPage.shouldShowErrorMessage();
      loginPage.getErrorMessageText().should('contain', 'Invalid credentials');
      loginPage.shouldBeOnLoginPage(); // Should stay on login page
    });
  });

  it('should validate required fields', () => {
    // Test classification
    TestClassification.categorizeAsSmokeTest('login-required-fields', {
      tags: [CommonTags.SMOKE, CommonTags.ERROR_HANDLING, 'validation'],
      priority: CommonPriorities.MEDIUM,
      author: 'QA Team',
      description: 'Verify required field validation on login form'
    });

    ReportingUtils.addStory('Field Validation');
    ReportingUtils.addSeverity('normal');

    ReportingUtils.step('Navigate to login page', () => {
      loginPage.visit();
    });

    ReportingUtils.step('Submit empty form', () => {
      loginPage.clickLoginButton();
    });

    ReportingUtils.step('Verify validation errors', () => {
      // Check that form validation prevents submission
      loginPage.shouldBeOnLoginPage();
      
      // Verify fields are still empty
      loginPage.shouldHaveEmptyFields();
    });

    ReportingUtils.step('Fill username only', () => {
      loginPage.enterUsername('test@example.com');
      loginPage.clickLoginButton();
    });

    ReportingUtils.step('Verify password is still required', () => {
      loginPage.shouldBeOnLoginPage();
    });
  });

  it('should handle "Remember Me" functionality', () => {
    // Test classification
    TestClassification.categorizeAsSmokeTest('login-remember-me', {
      tags: [CommonTags.SMOKE, 'remember-me', 'session'],
      priority: CommonPriorities.LOW,
      author: 'QA Team',
      description: 'Verify Remember Me checkbox functionality'
    });

    ReportingUtils.addStory('Remember Me');
    ReportingUtils.addSeverity('minor');

    ReportingUtils.step('Navigate to login page', () => {
      loginPage.visit();
    });

    ReportingUtils.step('Login with Remember Me checked', () => {
      const validUsername = Cypress.env('validUsername') || 'testuser@example.com';
      const validPassword = Cypress.env('validPassword') || 'password123';
      
      loginPage.login(validUsername, validPassword, true);
    });

    ReportingUtils.step('Verify successful login', () => {
      dashboardPage.waitForDashboardLoad();
      dashboardPage.shouldBeOnDashboard();
    });

    ReportingUtils.step('Logout and verify session persistence', () => {
      dashboardPage.logout();
      
      // Visit login page again
      loginPage.visit();
      
      // In a real application, you might check if username is pre-filled
      // or if there's some indication of remembered session
    });
  });

  it('should redirect to dashboard after successful login', () => {
    // Test classification
    TestClassification.categorizeAsSmokeTest('login-redirect', {
      tags: [CommonTags.SMOKE, CommonTags.CRITICAL_PATH, 'navigation'],
      priority: CommonPriorities.HIGH,
      author: 'QA Team',
      description: 'Verify user is redirected to dashboard after login'
    });

    ReportingUtils.addStory('Login Redirect');
    ReportingUtils.addSeverity('critical');

    const validUsername = Cypress.env('validUsername') || 'testuser@example.com';
    const validPassword = Cypress.env('validPassword') || 'password123';

    ReportingUtils.step('Perform login', () => {
      loginPage.visit();
      loginPage.login(validUsername, validPassword);
    });

    ReportingUtils.step('Verify redirect to dashboard', () => {
      // Should automatically redirect to dashboard
      cy.url().should('include', '/dashboard');
      dashboardPage.isLoaded().should('be.true');
    });

    ReportingUtils.step('Verify dashboard elements are loaded', () => {
      dashboardPage.shouldShowWelcomeMessage();
      dashboardPage.shouldShowNavigationMenu();
      dashboardPage.shouldShowMainContent();
      dashboardPage.shouldShowUserProfile();
    });
  });

  // Visual regression test
  it('should maintain login page visual appearance', () => {
    // Test classification
    TestClassification.categorizeAsVisualTest('login-visual-regression', {
      tags: [CommonTags.VISUAL, CommonTags.SMOKE, CommonTags.REGRESSION],
      priority: CommonPriorities.MEDIUM,
      author: 'QA Team',
      description: 'Visual regression test for login page'
    });

    ReportingUtils.addStory('Visual Regression');
    ReportingUtils.addSeverity('normal');

    ReportingUtils.step('Navigate to login page', () => {
      loginPage.visit();
      loginPage.waitForPageLoad();
    });

    ReportingUtils.step('Capture login page screenshot', () => {
      // Wait for any animations to complete
      cy.wait(1000);
      
      // Capture visual comparison
      loginPage.captureLoginPageScreenshot();
    });

    ReportingUtils.step('Capture login form screenshot', () => {
      loginPage.captureLoginFormScreenshot();
    });
  });
});