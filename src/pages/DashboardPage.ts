import { BasePage } from './BasePage';
import { PageElement } from '../types';

export class DashboardPage extends BasePage {
  constructor(baseUrl: string = Cypress.config('baseUrl') || 'https://example.com') {
    const url = `${baseUrl}/dashboard`;
    
    const elements: Record<string, PageElement> = {
      welcomeMessage: {
        selector: '[data-testid="welcome-message"], .welcome, h1:contains("Welcome")',
        name: 'Welcome Message',
        type: 'text',
        options: { timeout: 10000 }
      },
      userProfile: {
        selector: '[data-testid="user-profile"], .user-profile, .profile-dropdown',
        name: 'User Profile',
        type: 'container'
      },
      navigationMenu: {
        selector: '[data-testid="nav-menu"], .nav-menu, .sidebar, nav',
        name: 'Navigation Menu',
        type: 'container'
      },
      logoutButton: {
        selector: '[data-testid="logout"], .logout, a[href*="logout"]',
        name: 'Logout Button',
        type: 'button'
      },
      searchBox: {
        selector: '[data-testid="search"], .search-input, input[type="search"]',
        name: 'Search Box',
        type: 'input'
      },
      notificationsBell: {
        selector: '[data-testid="notifications"], .notifications, .bell-icon',
        name: 'Notifications Bell',
        type: 'button'
      },
      settingsButton: {
        selector: '[data-testid="settings"], .settings, a[href*="settings"]',
        name: 'Settings Button',
        type: 'button'
      },
      mainContent: {
        selector: '[data-testid="main-content"], .main-content, main',
        name: 'Main Content Area',
        type: 'container'
      },
      dataTable: {
        selector: '[data-testid="data-table"], .data-table, table',
        name: 'Data Table',
        type: 'container'
      },
      addButton: {
        selector: '[data-testid="add-button"], .add-btn, button:contains("Add")',
        name: 'Add Button',
        type: 'button'
      },
      refreshButton: {
        selector: '[data-testid="refresh"], .refresh-btn, button:contains("Refresh")',
        name: 'Refresh Button',
        type: 'button'
      },
      filterDropdown: {
        selector: '[data-testid="filter"], .filter-dropdown, select[name="filter"]',
        name: 'Filter Dropdown',
        type: 'select'
      },
      loadingIndicator: {
        selector: '[data-testid="loading"], .loading, .spinner',
        name: 'Loading Indicator',
        type: 'container'
      },
      breadcrumb: {
        selector: '[data-testid="breadcrumb"], .breadcrumb, nav[aria-label="breadcrumb"]',
        name: 'Breadcrumb Navigation',
        type: 'container'
      },
      statusBar: {
        selector: '[data-testid="status-bar"], .status-bar, .footer-status',
        name: 'Status Bar',
        type: 'container'
      }
    };

    const expectedElements = ['welcomeMessage', 'navigationMenu', 'mainContent', 'userProfile'];
    
    super(url, elements, expectedElements, 15000);
  }

  isLoaded(): Cypress.Chainable<boolean> {
    return cy.url().then((url) => {
      const isOnDashboard = url.includes('/dashboard');
      
      return cy.get('body').then(($body) => {
        const hasWelcomeMessage = $body.find(this.elements.welcomeMessage.selector).length > 0;
        const hasNavigation = $body.find(this.elements.navigationMenu.selector).length > 0;
        
        return isOnDashboard && (hasWelcomeMessage || hasNavigation);
      });
    });
  }

  // Navigation methods
  logout(): Cypress.Chainable<void> {
    cy.addTestLog('Logging out from dashboard', 'info');
    return this.clickElement('logoutButton');
  }

  openSettings(): Cypress.Chainable<void> {
    cy.addTestLog('Opening settings', 'info');
    return this.clickElement('settingsButton');
  }

  openNotifications(): Cypress.Chainable<void> {
    cy.addTestLog('Opening notifications', 'info');
    return this.clickElement('notificationsBell');
  }

  openUserProfile(): Cypress.Chainable<void> {
    cy.addTestLog('Opening user profile', 'info');
    return this.clickElement('userProfile');
  }

  // Search functionality
  performSearch(searchTerm: string): Cypress.Chainable<void> {
    cy.addTestLog(`Searching for: ${searchTerm}`, 'info');
    
    return this.clearAndType('searchBox', searchTerm).then(() => {
      // Press Enter to execute search
      this.getElement('searchBox').type('{enter}');
    });
  }

  clearSearch(): Cypress.Chainable<void> {
    return this.getElement('searchBox').clear();
  }

  // Data table operations
  refreshData(): Cypress.Chainable<void> {
    cy.addTestLog('Refreshing data', 'info');
    return this.clickElement('refreshButton').then(() => {
      this.waitForDataLoad();
    });
  }

  addNewItem(): Cypress.Chainable<void> {
    cy.addTestLog('Adding new item', 'info');
    return this.clickElement('addButton');
  }

  applyFilter(filterValue: string): Cypress.Chainable<void> {
    cy.addTestLog(`Applying filter: ${filterValue}`, 'info');
    return this.selectOption('filterDropdown', filterValue).then(() => {
      this.waitForDataLoad();
    });
  }

  // Table interaction methods
  getTableRowCount(): Cypress.Chainable<number> {
    return this.getElement('dataTable').find('tbody tr').its('length');
  }

  getTableRow(index: number): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.getElement('dataTable').find('tbody tr').eq(index);
  }

  getTableCellValue(rowIndex: number, columnIndex: number): Cypress.Chainable<string> {
    return this.getTableRow(rowIndex).find('td').eq(columnIndex).invoke('text').then(text => text.trim());
  }

  clickTableRow(index: number): Cypress.Chainable<void> {
    cy.addTestLog(`Clicking table row ${index}`, 'info');
    return this.getTableRow(index).click();
  }

  sortTableByColumn(columnName: string): Cypress.Chainable<void> {
    cy.addTestLog(`Sorting table by column: ${columnName}`, 'info');
    return this.getElement('dataTable').find(`th:contains("${columnName}")`).click();
  }

  // Validation methods
  shouldShowWelcomeMessage(expectedText?: string): Cypress.Chainable<JQuery<HTMLElement>> {
    const chainable = this.shouldBeVisible('welcomeMessage');
    
    if (expectedText) {
      return chainable.should('contain', expectedText);
    }
    
    return chainable;
  }

  shouldShowNavigationMenu(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.shouldBeVisible('navigationMenu');
  }

  shouldShowMainContent(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.shouldBeVisible('mainContent');
  }

  shouldShowUserProfile(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.shouldBeVisible('userProfile');
  }

  shouldBeOnDashboard(): Cypress.Chainable<void> {
    return cy.url().should('include', '/dashboard');
  }

  shouldShowDataTable(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.shouldBeVisible('dataTable');
  }

  shouldHaveTableRows(minCount: number = 1): Cypress.Chainable<void> {
    return this.getTableRowCount().should('be.gte', minCount);
  }

  shouldNotBeLoading(): Cypress.Chainable<void> {
    return cy.get('body').then(($body) => {
      if ($body.find(this.elements.loadingIndicator.selector).length > 0) {
        cy.get(this.elements.loadingIndicator.selector).should('not.exist');
      }
    });
  }

  // Utility methods
  waitForDashboardLoad(): Cypress.Chainable<void> {
    cy.addTestLog('Waiting for dashboard to fully load', 'info');
    
    this.waitForPageLoad();
    this.shouldNotBeLoading();
    
    return cy.wrap(null);
  }

  waitForDataLoad(timeout: number = 10000): Cypress.Chainable<void> {
    cy.addTestLog('Waiting for data to load', 'info');
    
    return cy.waitUntil(() => {
      return cy.get('body').then(($body) => {
        return $body.find(this.elements.loadingIndicator.selector).length === 0;
      });
    }, {
      timeout,
      interval: 500,
      errorMsg: 'Data did not load within timeout'
    });
  }

  getUsernameFromProfile(): Cypress.Chainable<string> {
    return this.getElement('userProfile').invoke('text').then(text => text.trim());
  }

  getWelcomeMessageText(): Cypress.Chainable<string> {
    return this.getElement('welcomeMessage').invoke('text').then(text => text.trim());
  }

  isSearchBoxVisible(): Cypress.Chainable<boolean> {
    return cy.get('body').then(($body) => {
      return $body.find(this.elements.searchBox.selector).length > 0;
    });
  }

  hasNotifications(): Cypress.Chainable<boolean> {
    return this.getElement('notificationsBell').then(($bell) => {
      return $bell.find('.badge, .notification-count').length > 0;
    });
  }

  getNotificationCount(): Cypress.Chainable<number> {
    return this.getElement('notificationsBell').find('.badge, .notification-count').invoke('text').then(text => {
      return parseInt(text.trim()) || 0;
    });
  }

  // Navigation menu methods
  navigateToSection(sectionName: string): Cypress.Chainable<void> {
    cy.addTestLog(`Navigating to section: ${sectionName}`, 'info');
    
    return this.getElement('navigationMenu').find(`a:contains("${sectionName}"), [data-nav="${sectionName}"]`).first().click();
  }

  getNavigationItems(): Cypress.Chainable<string[]> {
    return this.getElement('navigationMenu').find('a, [role="menuitem"]').then(($items) => {
      const items: string[] = [];
      $items.each((index, element) => {
        items.push(Cypress.$(element).text().trim());
      });
      return items;
    });
  }

  // Visual testing methods
  captureDashboardScreenshot(name?: string): Cypress.Chainable<void> {
    return this.capturePageScreenshot(name || 'dashboard-page');
  }

  captureDataTableScreenshot(): Cypress.Chainable<void> {
    return this.captureElementScreenshot('dataTable', 'dashboard-data-table');
  }

  captureNavigationMenuScreenshot(): Cypress.Chainable<void> {
    return this.captureElementScreenshot('navigationMenu', 'dashboard-navigation');
  }

  // Responsive testing methods
  testResponsiveLayout(): Cypress.Chainable<void> {
    cy.addTestLog('Testing responsive layout', 'info');
    
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1280, height: 720, name: 'desktop' }
    ];
    
    viewports.forEach(viewport => {
      cy.viewport(viewport.width, viewport.height);
      cy.addTestLog(`Testing ${viewport.name} layout (${viewport.width}x${viewport.height})`, 'info');
      
      this.shouldShowNavigationMenu();
      this.shouldShowMainContent();
      
      this.capturePageScreenshot(`dashboard-${viewport.name}`);
    });
    
    return cy.wrap(null);
  }

  // Performance testing methods
  measurePageLoadTime(): Cypress.Chainable<number> {
    return cy.window().then((win) => {
      const navigation = win.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.navigationStart;
      
      cy.addTestLog(`Page load time: ${loadTime}ms`, 'info');
      
      return loadTime;
    });
  }
}