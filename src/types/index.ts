// Common types for the framework

export interface ElementOptions {
  timeout?: number;
  force?: boolean;
  multiple?: boolean;
  log?: boolean;
}

export interface AutoHealingConfig {
  enabled: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  maxRetries: number;
  reportPath: string;
}

export interface VisualTestingConfig {
  enabled: boolean;
  threshold: number;
  baselineDir: string;
  diffDir: string;
  actualDir: string;
}

export interface TestMetadata {
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical' | string;
  author: string;
  description: string;
  testId?: string;
}

export interface HealingLog {
  timestamp: string;
  testFile: string;
  oldSelector: string;
  newSelector: string;
  action: 'locator_updated' | 'element_found' | 'healing_failed';
  elementType?: string;
}

export interface VisualComparisonResult {
  passed: boolean;
  diffPixels: number;
  diffPath?: string;
  error?: string;
}

export interface TestDataUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

export interface TestDataAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface TestDataCompany {
  name: string;
  catchPhrase: string;
  bs: string;
}

export interface ApiResponse {
  status: number;
  body: any;
  headers: any;
  duration: number;
}

export interface PageElement {
  selector: string;
  name: string;
  type: 'button' | 'input' | 'select' | 'link' | 'text' | 'container';
  options?: ElementOptions;
}

export interface PageConfig {
  url: string;
  elements: Record<string, PageElement>;
  expectedElements?: string[];
  loadTimeout?: number;
}

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface FrameworkConfig {
  autoHealing: AutoHealingConfig;
  visualTesting: VisualTestingConfig;
  reporting: {
    allure: boolean;
    html: boolean;
    json: boolean;
  };
  environments: Record<string, string>;
  browsers: string[];
  viewports: Array<{
    width: number;
    height: number;
    name: string;
  }>;
}