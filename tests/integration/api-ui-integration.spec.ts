import { LoginPage } from '../../src/pages/LoginPage';
import { DashboardPage } from '../../src/pages/DashboardPage';
import { APIKeywords } from '../../src/keywords/APIKeywords';
import { TestClassification, CommonTags, CommonPriorities } from '../../src/utils/TestClassification';
import { ReportingUtils } from '../../src/utils/ReportingUtils';

describe('API-UI Integration Tests', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let authToken: string;

  before(() => {
    // Set up test suite metadata
    ReportingUtils.addEpic('Integration Testing');
    ReportingUtils.addFeature('API-UI Integration');
    
    // Obtain authentication token via API
    const username = Cypress.env('validUsername') || 'testuser@example.com';
    const password = Cypress.env('validPassword') || 'password123';
    
    APIKeywords.login(username, password).then((token) => {
      authToken = token;
      APIKeywords.setAuthToken(token);
    });
  });

  beforeEach(() => {
    loginPage = new LoginPage();
    dashboardPage = new DashboardPage();
    
    ReportingUtils.startTestTimer();
    ReportingUtils.attachEnvironmentInfo();
  });

  afterEach(() => {
    ReportingUtils.endTestTimer();
    
    cy.then(() => {
      if (Cypress.currentTest.state === 'failed') {
        ReportingUtils.attachScreenshot(`failed-${Cypress.currentTest.title}`);
      }
    });
  });

  it('should sync user data between API and UI', () => {
    // Test classification
    TestClassification.categorizeAsIntegrationTest('api-ui-user-data-sync', {
      tags: [CommonTags.INTEGRATION, CommonTags.API, CommonTags.UI],
      priority: CommonPriorities.HIGH,
      author: 'Integration Team',
      description: 'Verify user data synchronization between API and UI'
    });

    ReportingUtils.addStory('User Data Sync');
    ReportingUtils.addSeverity('critical');

    let userData: any;

    ReportingUtils.step('Fetch user data via API', () => {
      APIKeywords.authenticatedGet('/api/user/profile').then((response) => {
        APIKeywords.validateStatus(response, 200);
        userData = response.body;
        
        // Validate response structure
        expect(userData).to.have.property('id');
        expect(userData).to.have.property('username');
        expect(userData).to.have.property('email');
        
        ReportingUtils.attachApiResponse('User Profile API', response);
      });
    });

    ReportingUtils.step('Login and navigate to profile page', () => {
      loginPage.visit();
      loginPage.loginWithValidCredentials();
      
      dashboardPage.waitForDashboardLoad();
      dashboardPage.openUserProfile();
    });

    ReportingUtils.step('Verify UI displays correct user data', () => {
      cy.wrap(userData).then((user: any) => {
        // Verify username is displayed correctly
        cy.get('[data-testid="profile-username"]').should('contain', user.username);
        
        // Verify email is displayed correctly
        cy.get('[data-testid="profile-email"]').should('contain', user.email);
        
        // Verify user ID matches (if displayed)
        cy.get('[data-testid="profile-id"]').should('contain', user.id);
      });
    });

    ReportingUtils.step('Update user data via API', () => {
      const updatedData = {
        username: userData.username + '_updated',
        email: 'updated_' + userData.email
      };

      APIKeywords.authenticatedPut('/api/user/profile', updatedData).then((response) => {
        APIKeywords.validateStatus(response, 200);
        ReportingUtils.attachApiResponse('Update Profile API', response);
      });
    });

    ReportingUtils.step('Refresh UI and verify updated data', () => {
      cy.reload();
      
      // Wait for page to load
      dashboardPage.waitForDashboardLoad();
      dashboardPage.openUserProfile();
      
      // Verify UI shows updated data
      cy.get('[data-testid="profile-username"]').should('contain', userData.username + '_updated');
      cy.get('[data-testid="profile-email"]').should('contain', 'updated_' + userData.email);
    });
  });

  it('should handle API errors gracefully in UI', () => {
    // Test classification
    TestClassification.categorizeAsIntegrationTest('api-error-handling', {
      tags: [CommonTags.INTEGRATION, CommonTags.ERROR_HANDLING, CommonTags.API],
      priority: CommonPriorities.HIGH,
      author: 'Integration Team',
      description: 'Verify UI handles API errors appropriately'
    });

    ReportingUtils.addStory('API Error Handling');
    ReportingUtils.addSeverity('critical');

    ReportingUtils.step('Login to application', () => {
      loginPage.visit();
      loginPage.loginWithValidCredentials();
      dashboardPage.waitForDashboardLoad();
    });

    ReportingUtils.step('Simulate API error by using invalid endpoint', () => {
      // Intercept API call and return error
      cy.intercept('GET', '/api/invalid-endpoint', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('apiError');
      
      // Trigger API call that will fail
      cy.get('[data-testid="fetch-data-button"]').click();
      
      // Wait for the intercepted call
      cy.wait('@apiError');
    });

    ReportingUtils.step('Verify UI shows appropriate error message', () => {
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain', 'Unable to fetch data');
      
      // Verify error doesn't break the UI
      dashboardPage.shouldShowNavigationMenu();
      dashboardPage.shouldShowMainContent();
    });

    ReportingUtils.step('Verify retry functionality works', () => {
      // Mock successful response for retry
      cy.intercept('GET', '/api/data', { statusCode: 200, body: { data: 'success' } }).as('apiSuccess');
      
      cy.get('[data-testid="retry-button"]').click();
      cy.wait('@apiSuccess');
      
      // Verify error message disappears
      cy.get('[data-testid="error-message"]').should('not.exist');
      
      // Verify data is displayed
      cy.get('[data-testid="data-container"]').should('be.visible');
    });
  });

  it('should validate data consistency between multiple API endpoints and UI', () => {
    // Test classification
    TestClassification.categorizeAsIntegrationTest('data-consistency-validation', {
      tags: [CommonTags.INTEGRATION, CommonTags.API, 'data-consistency'],
      priority: CommonPriorities.MEDIUM,
      author: 'Integration Team',
      description: 'Verify data consistency across multiple API endpoints and UI'
    });

    ReportingUtils.addStory('Data Consistency');
    ReportingUtils.addSeverity('normal');

    let userFromProfile: any;
    let userFromSettings: any;
    let userFromDashboard: any;

    ReportingUtils.step('Fetch user data from multiple API endpoints', () => {
      // Get user from profile endpoint
      APIKeywords.authenticatedGet('/api/user/profile').then((response) => {
        APIKeywords.validateStatus(response, 200);
        userFromProfile = response.body;
      });

      // Get user from settings endpoint
      APIKeywords.authenticatedGet('/api/user/settings').then((response) => {
        APIKeywords.validateStatus(response, 200);
        userFromSettings = response.body.user;
      });

      // Get user from dashboard endpoint
      APIKeywords.authenticatedGet('/api/dashboard/user').then((response) => {
        APIKeywords.validateStatus(response, 200);
        userFromDashboard = response.body.user;
      });
    });

    ReportingUtils.step('Validate API data consistency', () => {
      cy.then(() => {
        // Verify all endpoints return consistent user data
        expect(userFromProfile.id).to.equal(userFromSettings.id);
        expect(userFromProfile.id).to.equal(userFromDashboard.id);
        
        expect(userFromProfile.username).to.equal(userFromSettings.username);
        expect(userFromProfile.username).to.equal(userFromDashboard.username);
        
        expect(userFromProfile.email).to.equal(userFromSettings.email);
        expect(userFromProfile.email).to.equal(userFromDashboard.email);
      });
    });

    ReportingUtils.step('Verify UI displays consistent data', () => {
      loginPage.visit();
      loginPage.loginWithValidCredentials();
      dashboardPage.waitForDashboardLoad();

      cy.then(() => {
        // Check dashboard displays correct user info
        dashboardPage.getUsernameFromProfile().should('equal', userFromProfile.username);
        
        // Navigate to settings and verify consistency
        dashboardPage.openSettings();
        cy.get('[data-testid="settings-username"]').should('contain', userFromProfile.username);
        cy.get('[data-testid="settings-email"]').should('contain', userFromProfile.email);
      });
    });
  });

  it('should handle concurrent API and UI operations', () => {
    // Test classification
    TestClassification.categorizeAsIntegrationTest('concurrent-operations', {
      tags: [CommonTags.INTEGRATION, CommonTags.PERFORMANCE, 'concurrency'],
      priority: CommonPriorities.MEDIUM,
      author: 'Integration Team',
      description: 'Verify system handles concurrent API and UI operations'
    });

    ReportingUtils.addStory('Concurrent Operations');
    ReportingUtils.addSeverity('normal');

    ReportingUtils.step('Login to application', () => {
      loginPage.visit();
      loginPage.loginWithValidCredentials();
      dashboardPage.waitForDashboardLoad();
    });

    ReportingUtils.step('Perform concurrent API calls and UI interactions', () => {
      // Start multiple API calls concurrently
      const apiPromises = [
        APIKeywords.authenticatedGet('/api/user/profile'),
        APIKeywords.authenticatedGet('/api/user/settings'),
        APIKeywords.authenticatedGet('/api/dashboard/data'),
        APIKeywords.authenticatedGet('/api/notifications')
      ];

      // Perform UI interactions while API calls are in progress
      dashboardPage.performSearch('test search');
      dashboardPage.refreshData();
      dashboardPage.openNotifications();

      // Wait for all API calls to complete
      cy.wrap(Promise.all(apiPromises)).then((responses: any) => {
        responses.forEach((response: any, index: number) => {
          expect(response.status).to.be.oneOf([200, 204]);
          ReportingUtils.attachApiResponse(`Concurrent API Call ${index + 1}`, response);
        });
      });
    });

    ReportingUtils.step('Verify UI remains responsive and data is accurate', () => {
      // Verify search results are displayed
      cy.get('[data-testid="search-results"]').should('be.visible');
      
      // Verify data refresh completed successfully
      dashboardPage.shouldNotBeLoading();
      
      // Verify notifications opened
      cy.get('[data-testid="notifications-panel"]').should('be.visible');
      
      // Verify overall UI integrity
      dashboardPage.shouldShowNavigationMenu();
      dashboardPage.shouldShowMainContent();
    });
  });

  it('should validate real-time data updates between API and UI', () => {
    // Test classification
    TestClassification.categorizeAsIntegrationTest('realtime-data-updates', {
      tags: [CommonTags.INTEGRATION, 'realtime', 'websocket'],
      priority: CommonPriorities.LOW,
      author: 'Integration Team',
      description: 'Verify real-time data synchronization between API and UI'
    });

    ReportingUtils.addStory('Real-time Updates');
    ReportingUtils.addSeverity('minor');

    ReportingUtils.step('Login and navigate to dashboard', () => {
      loginPage.visit();
      loginPage.loginWithValidCredentials();
      dashboardPage.waitForDashboardLoad();
    });

    ReportingUtils.step('Create data via API', () => {
      const newItem = {
        title: 'Test Item',
        description: 'Created via API',
        timestamp: new Date().toISOString()
      };

      APIKeywords.authenticatedPost('/api/items', newItem).then((response) => {
        APIKeywords.validateStatus(response, 201);
        
        const createdItem = response.body;
        
        // Wait for real-time update to appear in UI
        cy.get('[data-testid="items-list"]').should('contain', createdItem.title);
        cy.get('[data-testid="items-list"]').should('contain', createdItem.description);
        
        ReportingUtils.attachApiResponse('Create Item API', response);
      });
    });

    ReportingUtils.step('Update data via API and verify UI updates', () => {
      // Get the first item and update it
      APIKeywords.authenticatedGet('/api/items').then((response) => {
        const items = response.body.items;
        const firstItem = items[0];
        
        const updatedItem = {
          ...firstItem,
          title: firstItem.title + ' (Updated)',
          description: firstItem.description + ' - Modified'
        };

        APIKeywords.authenticatedPut(`/api/items/${firstItem.id}`, updatedItem).then((updateResponse) => {
          APIKeywords.validateStatus(updateResponse, 200);
          
          // Verify UI reflects the update
          cy.get('[data-testid="items-list"]').should('contain', updatedItem.title);
          cy.get('[data-testid="items-list"]').should('contain', updatedItem.description);
        });
      });
    });

    ReportingUtils.step('Delete data via API and verify UI updates', () => {
      APIKeywords.authenticatedGet('/api/items').then((response) => {
        const items = response.body.items;
        const itemToDelete = items[items.length - 1];
        
        APIKeywords.authenticatedDelete(`/api/items/${itemToDelete.id}`).then((deleteResponse) => {
          APIKeywords.validateStatus(deleteResponse, 204);
          
          // Verify item is removed from UI
          cy.get('[data-testid="items-list"]').should('not.contain', itemToDelete.title);
        });
      });
    });
  });
});