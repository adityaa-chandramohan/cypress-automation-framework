import { BasePage } from './BasePage';
import { PageElement } from '../types';

export class LoginPage extends BasePage {
  constructor(baseUrl: string = Cypress.config('baseUrl') || 'https://example.com') {
    const url = `${baseUrl}/login`;
    
    const elements: Record<string, PageElement> = {
      usernameInput: {
        selector: '#username',
        name: 'Username Input',
        type: 'input',
        options: { timeout: 10000 }
      },
      passwordInput: {
        selector: '#password',
        name: 'Password Input',
        type: 'input',
        options: { timeout: 10000 }
      },
      loginButton: {
        selector: '[data-testid="login-button"]',
        name: 'Login Button',
        type: 'button',
        options: { timeout: 5000 }
      },
      forgotPasswordLink: {
        selector: 'a[href*="forgot"]',
        name: 'Forgot Password Link',
        type: 'link'
      },
      signUpLink: {
        selector: 'a[href*="signup"]',
        name: 'Sign Up Link',
        type: 'link'
      },
      errorMessage: {
        selector: '.error-message, .alert-danger, [role="alert"]',
        name: 'Error Message',
        type: 'text'
      },
      loadingSpinner: {
        selector: '.loading, .spinner, [data-testid="loading"]',
        name: 'Loading Spinner',
        type: 'container'
      },
      rememberMeCheckbox: {
        selector: '#remember-me',
        name: 'Remember Me Checkbox',
        type: 'input'
      },
      loginForm: {
        selector: 'form[name="login"], .login-form, [data-testid="login-form"]',
        name: 'Login Form',
        type: 'container'
      },
      socialLoginGoogle: {
        selector: '[data-testid="google-login"], .google-login',
        name: 'Google Login Button',
        type: 'button'
      },
      socialLoginFacebook: {
        selector: '[data-testid="facebook-login"], .facebook-login',
        name: 'Facebook Login Button',
        type: 'button'
      }
    };

    const expectedElements = ['loginForm', 'usernameInput', 'passwordInput', 'loginButton'];
    
    super(url, elements, expectedElements);
  }

  isLoaded(): Cypress.Chainable<boolean> {
    return cy.url().then((url) => {
      const isOnLoginPage = url.includes('/login');
      const formExists = Cypress.$('form[name="login"], .login-form, [data-testid="login-form"]').length > 0;
      return isOnLoginPage && formExists;
    });
  }

  // Login methods
  login(username: string, password: string, rememberMe: boolean = false): Cypress.Chainable<void> {
    cy.addTestLog(`Logging in with username: ${username}`, 'info');
    
    this.enterUsername(username);
    this.enterPassword(password);
    
    if (rememberMe) {
      this.selectRememberMe();
    }
    
    return this.clickLoginButton();
  }

  enterUsername(username: string): Cypress.Chainable<void> {
    return this.clearAndType('usernameInput', username);
  }

  enterPassword(password: string): Cypress.Chainable<void> {
    return this.clearAndType('passwordInput', password);
  }

  clickLoginButton(): Cypress.Chainable<void> {
    return this.clickElement('loginButton').then(() => {
      // Wait for potential loading state
      cy.get('body').then(($body) => {
        if ($body.find(this.elements.loadingSpinner.selector).length > 0) {
          cy.addTestLog('Waiting for login to complete...', 'info');
          cy.get(this.elements.loadingSpinner.selector).should('not.exist');
        }
      });
    });
  }

  selectRememberMe(): Cypress.Chainable<void> {
    return this.checkElement('rememberMeCheckbox');
  }

  clickForgotPassword(): Cypress.Chainable<void> {
    return this.clickElement('forgotPasswordLink');
  }

  clickSignUp(): Cypress.Chainable<void> {
    return this.clickElement('signUpLink');
  }

  // Social login methods
  loginWithGoogle(): Cypress.Chainable<void> {
    cy.addTestLog('Attempting Google login', 'info');
    return this.clickElement('socialLoginGoogle');
  }

  loginWithFacebook(): Cypress.Chainable<void> {
    cy.addTestLog('Attempting Facebook login', 'info');
    return this.clickElement('socialLoginFacebook');
  }

  // Validation methods
  shouldShowErrorMessage(expectedMessage?: string): Cypress.Chainable<JQuery<HTMLElement>> {
    const chainable = this.shouldBeVisible('errorMessage');
    
    if (expectedMessage) {
      return chainable.should('contain', expectedMessage);
    }
    
    return chainable;
  }

  shouldNotShowErrorMessage(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.shouldNotBeVisible('errorMessage');
  }

  shouldHaveEmptyFields(): Cypress.Chainable<void> {
    this.shouldHaveValue('usernameInput', '');
    return this.shouldHaveValue('passwordInput', '');
  }

  shouldBeOnLoginPage(): Cypress.Chainable<void> {
    return cy.url().should('include', '/login');
  }

  shouldHaveLoginFormVisible(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.shouldBeVisible('loginForm');
  }

  // Utility methods
  getErrorMessageText(): Cypress.Chainable<string> {
    return this.getElement('errorMessage').invoke('text');
  }

  isLoginButtonEnabled(): Cypress.Chainable<boolean> {
    return this.getElement('loginButton').then(($btn) => {
      return !$btn.prop('disabled');
    });
  }

  isLoadingVisible(): Cypress.Chainable<boolean> {
    return cy.get('body').then(($body) => {
      return $body.find(this.elements.loadingSpinner.selector).length > 0;
    });
  }

  waitForLoginCompletion(timeout: number = 10000): Cypress.Chainable<void> {
    cy.addTestLog('Waiting for login to complete', 'info');
    
    return cy.waitUntil(() => {
      return cy.url().then((url) => !url.includes('/login'));
    }, {
      timeout,
      interval: 500,
      errorMsg: 'Login did not complete within timeout'
    });
  }

  // Test data methods
  loginWithValidCredentials(): Cypress.Chainable<void> {
    return cy.generateTestData('user').then((userData: any) => {
      // Use predefined valid credentials or generated ones
      const username = Cypress.env('validUsername') || userData.email;
      const password = Cypress.env('validPassword') || 'validPassword123';
      
      return this.login(username, password);
    });
  }

  loginWithInvalidCredentials(): Cypress.Chainable<void> {
    return cy.generateTestData('user').then((userData: any) => {
      return this.login(userData.email, 'invalidPassword');
    });
  }

  // Visual testing methods
  captureLoginPageScreenshot(name?: string): Cypress.Chainable<void> {
    return this.capturePageScreenshot(name || 'login-page');
  }

  captureLoginFormScreenshot(): Cypress.Chainable<void> {
    return this.captureElementScreenshot('loginForm', 'login-form');
  }

  // Accessibility methods
  checkLoginFormAccessibility(): Cypress.Chainable<void> {
    cy.addTestLog('Checking login form accessibility', 'info');
    
    // Check for proper labels
    this.getElement('usernameInput').should('have.attr', 'aria-label').or('have.attr', 'aria-labelledby');
    this.getElement('passwordInput').should('have.attr', 'aria-label').or('have.attr', 'aria-labelledby');
    
    // Check for form validation
    this.getElement('loginForm').should('have.attr', 'novalidate').or('not.have.attr', 'novalidate');
    
    return cy.wrap(null);
  }
}