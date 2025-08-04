export interface BrowserConfig {
  name: string;
  family: string;
  version?: string;
  headless?: boolean;
  args?: string[];
}

export interface ViewportConfig {
  width: number;
  height: number;
  name: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export interface PlatformConfig {
  browsers: BrowserConfig[];
  viewports: ViewportConfig[];
  userAgents: Record<string, string>;
}

export class PlatformConfigManager {
  private static instance: PlatformConfigManager;
  private config: PlatformConfig;

  private constructor() {
    this.config = this.getDefaultConfig();
  }

  public static getInstance(): PlatformConfigManager {
    if (!PlatformConfigManager.instance) {
      PlatformConfigManager.instance = new PlatformConfigManager();
    }
    return PlatformConfigManager.instance;
  }

  private getDefaultConfig(): PlatformConfig {
    return {
      browsers: [
        {
          name: 'chrome',
          family: 'chromium',
          headless: false,
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-sandbox',
            '--disable-dev-shm-usage'
          ]
        },
        {
          name: 'chrome',
          family: 'chromium',
          headless: true,
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--headless'
          ]
        },
        {
          name: 'firefox',
          family: 'firefox',
          headless: false
        },
        {
          name: 'firefox',
          family: 'firefox',
          headless: true
        },
        {
          name: 'edge',
          family: 'chromium',
          headless: false,
          args: [
            '--disable-web-security',
            '--no-sandbox'
          ]
        },
        {
          name: 'webkit',
          family: 'webkit',
          headless: false
        }
      ],
      viewports: [
        // Mobile devices
        { width: 375, height: 667, name: 'iPhone SE', deviceType: 'mobile' },
        { width: 375, height: 812, name: 'iPhone X/11/12', deviceType: 'mobile' },
        { width: 414, height: 896, name: 'iPhone XR/11', deviceType: 'mobile' },
        { width: 360, height: 640, name: 'Galaxy S5', deviceType: 'mobile' },
        { width: 412, height: 915, name: 'Pixel 5', deviceType: 'mobile' },
        
        // Tablets
        { width: 768, height: 1024, name: 'iPad Portrait', deviceType: 'tablet' },
        { width: 1024, height: 768, name: 'iPad Landscape', deviceType: 'tablet' },
        { width: 810, height: 1080, name: 'iPad Air', deviceType: 'tablet' },
        { width: 800, height: 1280, name: 'Galaxy Tab S4', deviceType: 'tablet' },
        
        // Desktop
        { width: 1024, height: 768, name: 'Desktop Small', deviceType: 'desktop' },
        { width: 1280, height: 720, name: 'Desktop Medium', deviceType: 'desktop' },
        { width: 1366, height: 768, name: 'Desktop Large', deviceType: 'desktop' },
        { width: 1920, height: 1080, name: 'Desktop XL', deviceType: 'desktop' },
        { width: 2560, height: 1440, name: 'Desktop 2K', deviceType: 'desktop' }
      ],
      userAgents: {
        chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
        safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        android: 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
      }
    };
  }

  // Browser configuration methods
  getBrowserConfig(browserName: string, headless: boolean = false): BrowserConfig | undefined {
    return this.config.browsers.find(b => 
      b.name === browserName && b.headless === headless
    );
  }

  getAllBrowsers(): BrowserConfig[] {
    return this.config.browsers;
  }

  getHeadlessBrowsers(): BrowserConfig[] {
    return this.config.browsers.filter(b => b.headless);
  }

  getHeadedBrowsers(): BrowserConfig[] {
    return this.config.browsers.filter(b => !b.headless);
  }

  // Viewport configuration methods
  getViewportConfig(name: string): ViewportConfig | undefined {
    return this.config.viewports.find(v => v.name === name);
  }

  getViewportsByType(deviceType: 'mobile' | 'tablet' | 'desktop'): ViewportConfig[] {
    return this.config.viewports.filter(v => v.deviceType === deviceType);
  }

  getMobileViewports(): ViewportConfig[] {
    return this.getViewportsByType('mobile');
  }

  getTabletViewports(): ViewportConfig[] {
    return this.getViewportsByType('tablet');
  }

  getDesktopViewports(): ViewportConfig[] {
    return this.getViewportsByType('desktop');
  }

  getAllViewports(): ViewportConfig[] {
    return this.config.viewports;
  }

  // User agent methods
  getUserAgent(platform: string): string | undefined {
    return this.config.userAgents[platform];
  }

  getAllUserAgents(): Record<string, string> {
    return this.config.userAgents;
  }

  // Cross-platform testing methods
  static runOnMultipleBrowsers(
    browsers: string[], 
    testFn: (browser: string) => void
  ): void {
    const manager = PlatformConfigManager.getInstance();
    
    browsers.forEach(browserName => {
      const config = manager.getBrowserConfig(browserName);
      if (!config) {
        cy.addTestLog(`Browser ${browserName} not found in configuration`, 'warn');
        return;
      }

      describe(`${browserName} tests`, () => {
        before(() => {
          cy.addTestLog(`Running tests on ${browserName}`, 'info');
        });

        testFn(browserName);
      });
    });
  }

  static runOnMultipleViewports(
    viewports: string[], 
    testFn: (viewport: ViewportConfig) => void
  ): void {
    const manager = PlatformConfigManager.getInstance();
    
    viewports.forEach(viewportName => {
      const viewport = manager.getViewportConfig(viewportName);
      if (!viewport) {
        cy.addTestLog(`Viewport ${viewportName} not found in configuration`, 'warn');
        return;
      }

      describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
        beforeEach(() => {
          cy.viewport(viewport.width, viewport.height);
          cy.addTestLog(`Set viewport to ${viewport.name}: ${viewport.width}x${viewport.height}`, 'info');
        });

        testFn(viewport);
      });
    });
  }

  static runResponsiveTests(testFn: (viewport: ViewportConfig) => void): void {
    const manager = PlatformConfigManager.getInstance();
    const viewports = [
      manager.getViewportConfig('iPhone SE'),
      manager.getViewportConfig('iPad Portrait'),
      manager.getViewportConfig('Desktop Medium')
    ].filter(Boolean) as ViewportConfig[];

    viewports.forEach(viewport => {
      describe(`Responsive - ${viewport.name}`, () => {
        beforeEach(() => {
          cy.viewport(viewport.width, viewport.height);
        });

        testFn(viewport);
      });
    });
  }

  // Device simulation methods
  static simulateMobileDevice(deviceName: string): void {
    const manager = PlatformConfigManager.getInstance();
    const viewport = manager.getViewportConfig(deviceName);
    
    if (!viewport || viewport.deviceType !== 'mobile') {
      throw new Error(`Mobile device ${deviceName} not found`);
    }

    cy.viewport(viewport.width, viewport.height);
    
    // Set mobile user agent
    const mobileUA = manager.getUserAgent('android') || manager.getUserAgent('iphone');
    if (mobileUA) {
      cy.window().then(win => {
        Object.defineProperty(win.navigator, 'userAgent', {
          value: mobileUA,
          configurable: true
        });
      });
    }

    // Simulate touch events
    cy.window().then(win => {
      Object.defineProperty(win.navigator, 'maxTouchPoints', {
        value: 5,
        configurable: true
      });
    });

    cy.addTestLog(`Simulating mobile device: ${deviceName}`, 'info');
  }

  static simulateTabletDevice(deviceName: string): void {
    const manager = PlatformConfigManager.getInstance();
    const viewport = manager.getViewportConfig(deviceName);
    
    if (!viewport || viewport.deviceType !== 'tablet') {
      throw new Error(`Tablet device ${deviceName} not found`);
    }

    cy.viewport(viewport.width, viewport.height);
    
    // Set tablet-specific properties
    cy.window().then(win => {
      Object.defineProperty(win.navigator, 'maxTouchPoints', {
        value: 10,
        configurable: true
      });
    });

    cy.addTestLog(`Simulating tablet device: ${deviceName}`, 'info');
  }

  // Network simulation
  static simulateNetworkCondition(condition: 'fast3g' | 'slow3g' | 'offline'): void {
    const conditions = {
      fast3g: {
        downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
        uploadThroughput: 750 * 1024 / 8, // 750 Kbps
        latency: 150
      },
      slow3g: {
        downloadThroughput: 500 * 1024 / 8, // 500 Kbps
        uploadThroughput: 500 * 1024 / 8, // 500 Kbps
        latency: 300
      },
      offline: {
        downloadThroughput: 0,
        uploadThroughput: 0,
        latency: 0
      }
    };

    const networkCondition = conditions[condition];
    
    // This would typically be implemented with browser-specific network throttling
    cy.addTestLog(`Simulating ${condition} network condition`, 'info');
    
    // For Chromium browsers, you could use CDP commands
    if (Cypress.browser.name === 'chrome' || Cypress.browser.name === 'edge') {
      cy.task('log', `Network throttling: ${JSON.stringify(networkCondition)}`);
    }
  }

  // Browser feature detection
  static checkBrowserFeatures(): Cypress.Chainable<BrowserFeatures> {
    return cy.window().then(win => {
      const features: BrowserFeatures = {
        webGL: !!win.WebGLRenderingContext,
        webGL2: !!win.WebGL2RenderingContext,
        webRTC: !!(win.RTCPeerConnection || win.webkitRTCPeerConnection || win.mozRTCPeerConnection),
        serviceWorker: 'serviceWorker' in win.navigator,
        webAssembly: 'WebAssembly' in win,
        intersectionObserver: 'IntersectionObserver' in win,
        resizeObserver: 'ResizeObserver' in win,
        mutationObserver: 'MutationObserver' in win,
        localStorage: 'localStorage' in win,
        sessionStorage: 'sessionStorage' in win,
        indexedDB: 'indexedDB' in win,
        webSockets: 'WebSocket' in win,
        geolocation: 'geolocation' in win.navigator,
        notifications: 'Notification' in win,
        pushManager: 'PushManager' in win,
        touchEvents: 'TouchEvent' in win,
        pointerEvents: 'PointerEvent' in win
      };

      cy.addTestLog(`Browser features detected: ${Object.keys(features).filter(k => features[k as keyof BrowserFeatures]).join(', ')}`, 'info');
      
      return features;
    });
  }

  // Performance testing across platforms
  static measurePerformanceAcrossPlatforms(
    viewports: string[] = ['iPhone SE', 'iPad Portrait', 'Desktop Medium']
  ): Cypress.Chainable<PerformanceResult[]> {
    const manager = PlatformConfigManager.getInstance();
    const results: PerformanceResult[] = [];
    
    const measureNext = (index: number): Cypress.Chainable<PerformanceResult[]> => {
      if (index >= viewports.length) {
        return cy.wrap(results);
      }

      const viewportName = viewports[index];
      const viewport = manager.getViewportConfig(viewportName);
      
      if (!viewport) {
        return measureNext(index + 1);
      }

      return cy.viewport(viewport.width, viewport.height).then(() => {
        return cy.window().then(win => {
          const navigation = win.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          const result: PerformanceResult = {
            viewport: viewport.name,
            loadTime: navigation.loadEventEnd - navigation.navigationStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
            firstPaint: win.performance.getEntriesByType('paint')
              .find(p => p.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: win.performance.getEntriesByType('paint')
              .find(p => p.name === 'first-contentful-paint')?.startTime || 0
          };

          results.push(result);
          return measureNext(index + 1);
        });
      });
    };

    return measureNext(0);
  }

  // Custom configuration methods
  addBrowser(config: BrowserConfig): void {
    this.config.browsers.push(config);
  }

  addViewport(config: ViewportConfig): void {
    this.config.viewports.push(config);
  }

  addUserAgent(platform: string, userAgent: string): void {
    this.config.userAgents[platform] = userAgent;
  }

  // Configuration export/import
  exportConfig(): PlatformConfig {
    return JSON.parse(JSON.stringify(this.config));
  }

  importConfig(config: Partial<PlatformConfig>): void {
    if (config.browsers) {
      this.config.browsers = config.browsers;
    }
    if (config.viewports) {
      this.config.viewports = config.viewports;
    }
    if (config.userAgents) {
      this.config.userAgents = config.userAgents;
    }
  }
}

// Type definitions
interface BrowserFeatures {
  webGL: boolean;
  webGL2: boolean;
  webRTC: boolean;
  serviceWorker: boolean;
  webAssembly: boolean;
  intersectionObserver: boolean;
  resizeObserver: boolean;
  mutationObserver: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  webSockets: boolean;
  geolocation: boolean;
  notifications: boolean;
  pushManager: boolean;
  touchEvents: boolean;
  pointerEvents: boolean;
}

interface PerformanceResult {
  viewport: string;
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
}

// Predefined test suites for different platforms
export const platformTestSuites = {
  crossBrowser: ['chrome', 'firefox', 'edge'],
  headlessBrowsers: ['chrome', 'firefox'],
  mobileBrowsers: ['chrome'], // Would typically include mobile-specific browsers
  
  responsive: ['iPhone SE', 'iPad Portrait', 'Desktop Medium'],
  mobile: ['iPhone SE', 'iPhone X/11/12', 'Galaxy S5'],
  tablet: ['iPad Portrait', 'iPad Air', 'Galaxy Tab S4'],
  desktop: ['Desktop Medium', 'Desktop Large', 'Desktop XL']
};

// Utility functions
export const platformUtils = {
  isMobile: (viewport: ViewportConfig): boolean => viewport.deviceType === 'mobile',
  isTablet: (viewport: ViewportConfig): boolean => viewport.deviceType === 'tablet',
  isDesktop: (viewport: ViewportConfig): boolean => viewport.deviceType === 'desktop',
  
  getViewportRatio: (viewport: ViewportConfig): number => viewport.width / viewport.height,
  isPortrait: (viewport: ViewportConfig): boolean => viewport.height > viewport.width,
  isLandscape: (viewport: ViewportConfig): boolean => viewport.width > viewport.height,
  
  formatViewportName: (viewport: ViewportConfig): string => 
    `${viewport.name} (${viewport.width}x${viewport.height})`,
  
  groupViewportsByType: (viewports: ViewportConfig[]): Record<string, ViewportConfig[]> => {
    return viewports.reduce((groups, viewport) => {
      const type = viewport.deviceType;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(viewport);
      return groups;
    }, {} as Record<string, ViewportConfig[]>);
  }
};