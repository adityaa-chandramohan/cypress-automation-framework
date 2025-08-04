import { LoginPage } from '../../src/pages/LoginPage';
import { DashboardPage } from '../../src/pages/DashboardPage';
import { VisualTesting, commonViewports, visualUtils } from '../../src/utils/VisualTesting';
import { PlatformConfigManager, platformTestSuites } from '../../src/config/PlatformConfig';
import { TestClassification, CommonTags, CommonPriorities } from '../../src/utils/TestClassification';
import { ReportingUtils } from '../../src/utils/ReportingUtils';

describe('Responsive Design - Visual Tests', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  const platformManager = PlatformConfigManager.getInstance();

  before(() => {
    // Set up test suite metadata
    ReportingUtils.addEpic('Visual Testing');
    ReportingUtils.addFeature('Responsive Design');
    
    // Enable visual testing
    VisualTesting.enableVisualTesting();
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

  after(() => {
    // Generate visual testing report
    VisualTesting.generateVisualReport();
  });

  it('should display login page correctly across all device types', () => {
    // Test classification
    TestClassification.categorizeAsVisualTest('login-responsive-design', {
      tags: [CommonTags.VISUAL, CommonTags.RESPONSIVE, CommonTags.CROSS_BROWSER],
      priority: CommonPriorities.HIGH,
      author: 'Visual Testing Team',
      description: 'Verify login page responsive design across all device types'
    });

    ReportingUtils.addStory('Login Page Responsive Design');
    ReportingUtils.addSeverity('critical');

    ReportingUtils.step('Test mobile viewports', () => {
      const mobileViewports = platformManager.getMobileViewports();
      
      mobileViewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height);
        
        loginPage.visit();
        loginPage.waitForPageLoad();
        
        // Allow time for responsive changes
        cy.wait(1000);
        
        // Verify mobile-specific elements are visible
        cy.get('[data-testid="login-form"]').should('be.visible');
        
        // Capture screenshot for this viewport
        VisualTesting.compareScreenshot(`login-mobile-${viewport.name.toLowerCase().replace(/\s+/g, '-')}`);
      });
    });

    ReportingUtils.step('Test tablet viewports', () => {
      const tabletViewports = platformManager.getTabletViewports();
      
      tabletViewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height);
        
        loginPage.visit();
        loginPage.waitForPageLoad();
        cy.wait(1000);
        
        // Verify tablet layout
        cy.get('[data-testid="login-form"]').should('be.visible');
        
        VisualTesting.compareScreenshot(`login-tablet-${viewport.name.toLowerCase().replace(/\s+/g, '-')}`);
      });
    });

    ReportingUtils.step('Test desktop viewports', () => {
      const desktopViewports = platformManager.getDesktopViewports();
      
      desktopViewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height);
        
        loginPage.visit();
        loginPage.waitForPageLoad();
        cy.wait(1000);
        
        // Verify desktop layout
        cy.get('[data-testid="login-form"]').should('be.visible');
        
        VisualTesting.compareScreenshot(`login-desktop-${viewport.name.toLowerCase().replace(/\s+/g, '-')}`);
      });
    });
  });

  it('should display dashboard correctly on different screen sizes', () => {
    // Test classification
    TestClassification.categorizeAsVisualTest('dashboard-responsive-design', {
      tags: [CommonTags.VISUAL, CommonTags.RESPONSIVE, 'dashboard'],
      priority: CommonPriorities.HIGH,
      author: 'Visual Testing Team',
      description: 'Verify dashboard responsive design across screen sizes'
    });

    ReportingUtils.addStory('Dashboard Responsive Design');
    ReportingUtils.addSeverity('critical');

    ReportingUtils.step('Login to application', () => {
      loginPage.visit();
      loginPage.loginWithValidCredentials();
      dashboardPage.waitForDashboardLoad();
    });

    ReportingUtils.step('Test responsive dashboard layout', () => {
      const testViewports = [
        platformManager.getViewportConfig('iPhone SE'),
        platformManager.getViewportConfig('iPad Portrait'),
        platformManager.getViewportConfig('Desktop Medium')
      ].filter(Boolean);

      testViewports.forEach(viewport => {
        if (viewport) {
          cy.viewport(viewport.width, viewport.height);
          cy.wait(1000); // Allow responsive changes
          
          // Verify key dashboard elements are visible and properly positioned
          dashboardPage.shouldShowNavigationMenu();
          dashboardPage.shouldShowMainContent();
          
          // Capture full page screenshot
          VisualTesting.compareFullPage(`dashboard-${viewport.name.toLowerCase().replace(/\s+/g, '-')}`);
          
          // Capture navigation menu specifically
          VisualTesting.compareElement(
            '[data-testid="nav-menu"]',
            `nav-menu-${viewport.name.toLowerCase().replace(/\s+/g, '-')}`
          );
        }
      });
    });
  });

  it('should handle navigation menu responsiveness', () => {
    // Test classification
    TestClassification.categorizeAsVisualTest('navigation-responsive', {
      tags: [CommonTags.VISUAL, CommonTags.RESPONSIVE, 'navigation'],
      priority: CommonPriorities.MEDIUM,
      author: 'Visual Testing Team',
      description: 'Verify navigation menu responsive behavior'
    });

    ReportingUtils.addStory('Navigation Responsiveness');
    ReportingUtils.addSeverity('normal');

    ReportingUtils.step('Login and access dashboard', () => {
      loginPage.visit();
      loginPage.loginWithValidCredentials();
      dashboardPage.waitForDashboardLoad();
    });

    ReportingUtils.step('Test mobile navigation (hamburger menu)', () => {
      const mobileViewport = platformManager.getViewportConfig('iPhone SE');
      if (mobileViewport) {
        cy.viewport(mobileViewport.width, mobileViewport.height);
        cy.wait(1000);
        
        // Check if hamburger menu is visible on mobile
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid="hamburger-menu"]').length > 0) {
            // Capture closed state
            VisualTesting.compareScreenshot('mobile-nav-closed');
            
            // Open hamburger menu
            cy.get('[data-testid="hamburger-menu"]').click();
            cy.wait(500);
            
            // Capture open state
            VisualTesting.compareScreenshot('mobile-nav-open');
          }
        });
      }
    });

    ReportingUtils.step('Test tablet navigation layout', () => {
      const tabletViewport = platformManager.getViewportConfig('iPad Portrait');
      if (tabletViewport) {
        cy.viewport(tabletViewport.width, tabletViewport.height);
        cy.wait(1000);
        
        // Capture tablet navigation layout
        VisualTesting.compareElement('[data-testid="nav-menu"]', 'tablet-navigation');
      }
    });

    ReportingUtils.step('Test desktop navigation layout', () => {
      const desktopViewport = platformManager.getViewportConfig('Desktop Medium');
      if (desktopViewport) {
        cy.viewport(desktopViewport.width, desktopViewport.height);
        cy.wait(1000);
        
        // Capture desktop navigation layout
        VisualTesting.compareElement('[data-testid="nav-menu"]', 'desktop-navigation');
      }
    });
  });

  it('should display forms correctly across different screen sizes', () => {
    // Test classification
    TestClassification.categorizeAsVisualTest('forms-responsive', {
      tags: [CommonTags.VISUAL, CommonTags.RESPONSIVE, 'forms'],
      priority: CommonPriorities.MEDIUM,
      author: 'Visual Testing Team',
      description: 'Verify form layouts are responsive across screen sizes'
    });

    ReportingUtils.addStory('Form Responsiveness');
    ReportingUtils.addSeverity('normal');

    ReportingUtils.step('Test login form responsiveness', () => {
      const responsiveViewports = [
        platformManager.getViewportConfig('iPhone SE'),
        platformManager.getViewportConfig('iPad Portrait'),
        platformManager.getViewportConfig('Desktop Medium')
      ].filter(Boolean);

      responsiveViewports.forEach(viewport => {
        if (viewport) {
          cy.viewport(viewport.width, viewport.height);
          
          loginPage.visit();
          loginPage.waitForPageLoad();
          cy.wait(1000);
          
          // Focus on different form elements to test states
          loginPage.getElement('usernameInput').focus();
          cy.wait(200);
          VisualTesting.compareElement(
            '[data-testid="login-form"]',
            `login-form-focus-${viewport.name.toLowerCase().replace(/\s+/g, '-')}`
          );
          
          // Test form with validation errors
          loginPage.clickLoginButton();
          cy.wait(500);
          VisualTesting.compareElement(
            '[data-testid="login-form"]',
            `login-form-validation-${viewport.name.toLowerCase().replace(/\s+/g, '-')}`
          );
        }
      });
    });
  });

  it('should maintain visual consistency across browser zoom levels', () => {
    // Test classification
    TestClassification.categorizeAsVisualTest('zoom-levels-consistency', {
      tags: [CommonTags.VISUAL, 'zoom', 'accessibility'],
      priority: CommonPriorities.LOW,
      author: 'Visual Testing Team',
      description: 'Verify visual consistency across different zoom levels'
    });

    ReportingUtils.addStory('Zoom Level Consistency');
    ReportingUtils.addSeverity('minor');

    const zoomLevels = [0.75, 1.0, 1.25, 1.5];

    ReportingUtils.step('Login to application', () => {
      loginPage.visit();
      loginPage.loginWithValidCredentials();
      dashboardPage.waitForDashboardLoad();
    });

    ReportingUtils.step('Test different zoom levels', () => {
      zoomLevels.forEach(zoomLevel => {
        // Set browser zoom level
        cy.window().then((win) => {
          win.document.body.style.zoom = zoomLevel.toString();
        });
        
        cy.wait(1000); // Allow time for zoom to take effect
        
        // Capture screenshot at this zoom level
        VisualTesting.compareFullPage(`dashboard-zoom-${zoomLevel.toString().replace('.', '-')}`);
        
        // Verify key elements are still accessible
        dashboardPage.shouldShowNavigationMenu();
        dashboardPage.shouldShowMainContent();
      });
    });

    ReportingUtils.step('Reset zoom level', () => {
      cy.window().then((win) => {
        win.document.body.style.zoom = '1.0';
      });
    });
  });

  it('should handle dynamic content resizing appropriately', () => {
    // Test classification
    TestClassification.categorizeAsVisualTest('dynamic-content-resize', {
      tags: [CommonTags.VISUAL, CommonTags.RESPONSIVE, 'dynamic-content'],
      priority: CommonPriorities.LOW,
      author: 'Visual Testing Team',
      description: 'Verify dynamic content resizes appropriately'
    });

    ReportingUtils.addStory('Dynamic Content Resize');
    ReportingUtils.addSeverity('minor');

    ReportingUtils.step('Login and navigate to dashboard', () => {
      loginPage.visit();
      loginPage.loginWithValidCredentials();
      dashboardPage.waitForDashboardLoad();
    });

    ReportingUtils.step('Test content overflow handling', () => {
      // Set mobile viewport
      cy.viewport(375, 667);
      
      // Add long content that might cause overflow
      cy.window().then((win) => {
        const element = win.document.querySelector('[data-testid="main-content"]');
        if (element) {
          element.innerHTML += '<div style="width: 1000px; background: red;">This is very long content that should handle overflow properly</div>';
        }
      });
      
      cy.wait(1000);
      
      // Capture how overflow is handled
      VisualTesting.compareScreenshot('mobile-content-overflow');
    });

    ReportingUtils.step('Test responsive images and media', () => {
      // Test different viewport sizes to see how images scale
      const testViewports = [
        { width: 320, height: 568, name: 'small-mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1920, height: 1080, name: 'large-desktop' }
      ];

      testViewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height);
        cy.wait(1000);
        
        // Check if images are present and capture their responsive behavior
        cy.get('body').then(($body) => {
          if ($body.find('img').length > 0) {
            VisualTesting.compareScreenshot(`images-responsive-${viewport.name}`);
          }
        });
      });
    });
  });

  it('should create visual baselines for new features', { tags: '@baseline' }, () => {
    // Test classification
    TestClassification.categorizeAsVisualTest('create-baselines', {
      tags: [CommonTags.VISUAL, 'baseline-creation'],
      priority: CommonPriorities.LOW,
      author: 'Visual Testing Team',
      description: 'Create visual baselines for new features'
    });

    ReportingUtils.addStory('Baseline Creation');
    ReportingUtils.addSeverity('minor');

    // This test is used to create new baselines
    // Run with: npm run cy:run -- --env grepTags=@baseline

    ReportingUtils.step('Create baselines for all viewports', () => {
      const allViewports = platformManager.getAllViewports();
      
      loginPage.visit();
      loginPage.waitForPageLoad();
      
      // Create login page baselines
      visualUtils.createBaselinesForViewports('login-page-baseline', allViewports.slice(0, 5)); // Limit to first 5 viewports
      
      // Login and create dashboard baselines
      loginPage.loginWithValidCredentials();
      dashboardPage.waitForDashboardLoad();
      
      visualUtils.createBaselinesForViewports('dashboard-baseline', allViewports.slice(0, 5));
    });
  });
});