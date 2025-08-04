import { defineConfig } from 'cypress';
import 'cypress-visual-regression/dist/plugin';

export default defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL || 'https://example.com',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'tests/**/*.spec.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    watchForFileChanges: false,
    chromeWebSecurity: false,
    retries: {
      runMode: 2,
      openMode: 0
    },
    env: {
      // Auto-healing configuration
      autoHealing: {
        enabled: true,
        sensitivity: 'medium', // low, medium, high
        maxRetries: 3,
        reportPath: 'reports/auto-healing.json'
      },
      // Visual testing configuration
      visualTesting: {
        enabled: true,
        threshold: 0.1,
        baselineDir: 'screenshots/baseline',
        diffDir: 'screenshots/diff',
        actualDir: 'screenshots/actual'
      },
      // Test classification
      tags: {
        smoke: ['@smoke'],
        regression: ['@regression'],
        integration: ['@integration'],
        visual: ['@visual']
      },
      // Environment specific configs
      environments: {
        dev: 'https://dev.example.com',
        staging: 'https://staging.example.com',
        prod: 'https://example.com'
      }
    },
    setupNodeEvents(on, config) {
      // Allure reporter setup - using proper plugin configuration
      try {
        const allureWriter = require('allure-cypress/writer');
        on('task', {
          writeAllureResults: allureWriter
        });
      } catch (error) {
        console.log('Allure plugin not properly configured, continuing without it');
      }
      
      // Visual regression setup
      try {
        const { initPlugin } = require('cypress-visual-regression/dist/plugin');
        initPlugin(on, config);
      } catch (error) {
        console.log('Visual regression plugin not properly configured, continuing without it');
      }
      
      // Grep plugin for test filtering
      require('@cypress/grep/src/plugin')(config);
      
      // Tasks for auto-healing and utilities
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        
        // Auto-healing task
        updateLocator({ selector, newSelector, testFile }) {
          const fs = require('fs');
          const path = require('path');
          
          try {
            const filePath = path.join(process.cwd(), testFile);
            let content = fs.readFileSync(filePath, 'utf8');
            content = content.replace(selector, newSelector);
            fs.writeFileSync(filePath, content, 'utf8');
            
            // Log healing action
            const healingLog = {
              timestamp: new Date().toISOString(),
              testFile,
              oldSelector: selector,
              newSelector,
              action: 'locator_updated'
            };
            
            const logPath = config.env.autoHealing.reportPath;
            let logs = [];
            
            if (fs.existsSync(logPath)) {
              logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
            }
            
            logs.push(healingLog);
            fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
            
            return { success: true, message: 'Locator updated successfully' };
          } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
          }
        },
        
        // Visual comparison task
        compareImages({ baseline, actual }) {
          const fs = require('fs');
          const path = require('path');
          const pixelmatch = require('pixelmatch');
          const { PNG } = require('pngjs');
          
          try {
            const baselineImage = PNG.sync.read(fs.readFileSync(baseline));
            const actualImage = PNG.sync.read(fs.readFileSync(actual));
            
            const { width, height } = baselineImage;
            const diff = new PNG({ width, height });
            
            const numDiffPixels = pixelmatch(
              baselineImage.data,
              actualImage.data,
              diff.data,
              width,
              height,
              { threshold: config.env.visualTesting.threshold }
            );
            
            const diffPath = path.join(
              config.env.visualTesting.diffDir,
              path.basename(actual, '.png') + '-diff.png'
            );
            
            fs.writeFileSync(diffPath, PNG.sync.write(diff));
            
            return {
              passed: numDiffPixels === 0,
              diffPixels: numDiffPixels,
              diffPath
            };
          } catch (error) {
            return { error: error instanceof Error ? error.message : String(error) };
          }
        }
      });
      
      return config;
    }
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.ts'
  }
});