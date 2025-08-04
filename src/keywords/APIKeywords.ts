import { ApiResponse } from '../types';

export class APIKeywords {
  private static baseHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  private static defaultTimeout = 30000;

  // GET requests
  static get(url: string, headers: Record<string, string> = {}, options: any = {}): Cypress.Chainable<ApiResponse> {
    cy.addTestLog(`GET request to: ${url}`, 'info');
    
    const mergedHeaders = { ...this.baseHeaders, ...headers };
    const requestOptions = {
      method: 'GET',
      url,
      headers: mergedHeaders,
      timeout: this.defaultTimeout,
      failOnStatusCode: false,
      ...options
    };

    return cy.request(requestOptions).then((response) => {
      const apiResponse: ApiResponse = {
        status: response.status,
        body: response.body,
        headers: response.headers,
        duration: response.duration
      };

      cy.addTestLog(`GET response: ${response.status} (${response.duration}ms)`, 'info');
      return apiResponse;
    });
  }

  // POST requests
  static post(url: string, body?: any, headers: Record<string, string> = {}, options: any = {}): Cypress.Chainable<ApiResponse> {
    cy.addTestLog(`POST request to: ${url}`, 'info');
    
    const mergedHeaders = { ...this.baseHeaders, ...headers };
    const requestOptions = {
      method: 'POST',
      url,
      body,
      headers: mergedHeaders,
      timeout: this.defaultTimeout,
      failOnStatusCode: false,
      ...options
    };

    return cy.request(requestOptions).then((response) => {
      const apiResponse: ApiResponse = {
        status: response.status,
        body: response.body,
        headers: response.headers,
        duration: response.duration
      };

      cy.addTestLog(`POST response: ${response.status} (${response.duration}ms)`, 'info');
      return apiResponse;
    });
  }

  // PUT requests
  static put(url: string, body?: any, headers: Record<string, string> = {}, options: any = {}): Cypress.Chainable<ApiResponse> {
    cy.addTestLog(`PUT request to: ${url}`, 'info');
    
    const mergedHeaders = { ...this.baseHeaders, ...headers };
    const requestOptions = {
      method: 'PUT',
      url,
      body,
      headers: mergedHeaders,
      timeout: this.defaultTimeout,
      failOnStatusCode: false,
      ...options
    };

    return cy.request(requestOptions).then((response) => {
      const apiResponse: ApiResponse = {
        status: response.status,
        body: response.body,
        headers: response.headers,
        duration: response.duration
      };

      cy.addTestLog(`PUT response: ${response.status} (${response.duration}ms)`, 'info');
      return apiResponse;
    });
  }

  // PATCH requests
  static patch(url: string, body?: any, headers: Record<string, string> = {}, options: any = {}): Cypress.Chainable<ApiResponse> {
    cy.addTestLog(`PATCH request to: ${url}`, 'info');
    
    const mergedHeaders = { ...this.baseHeaders, ...headers };
    const requestOptions = {
      method: 'PATCH',
      url,
      body,
      headers: mergedHeaders,
      timeout: this.defaultTimeout,
      failOnStatusCode: false,
      ...options
    };

    return cy.request(requestOptions).then((response) => {
      const apiResponse: ApiResponse = {
        status: response.status,
        body: response.body,
        headers: response.headers,
        duration: response.duration
      };

      cy.addTestLog(`PATCH response: ${response.status} (${response.duration}ms)`, 'info');
      return apiResponse;
    });
  }

  // DELETE requests
  static delete(url: string, headers: Record<string, string> = {}, options: any = {}): Cypress.Chainable<ApiResponse> {
    cy.addTestLog(`DELETE request to: ${url}`, 'info');
    
    const mergedHeaders = { ...this.baseHeaders, ...headers };
    const requestOptions = {
      method: 'DELETE',
      url,
      headers: mergedHeaders,
      timeout: this.defaultTimeout,
      failOnStatusCode: false,
      ...options
    };

    return cy.request(requestOptions).then((response) => {
      const apiResponse: ApiResponse = {
        status: response.status,
        body: response.body,
        headers: response.headers,
        duration: response.duration
      };

      cy.addTestLog(`DELETE response: ${response.status} (${response.duration}ms)`, 'info');
      return apiResponse;
    });
  }

  // Authentication methods
  static login(username: string, password: string, loginUrl?: string): Cypress.Chainable<string> {
    const url = loginUrl || `${Cypress.config('baseUrl')}/api/auth/login`;
    
    cy.addTestLog(`API Login for user: ${username}`, 'info');
    
    const loginData = { username, password };
    
    return this.post(url, loginData).then((response) => {
      if (response.status === 200 && response.body.token) {
        const token = response.body.token;
        
        // Store token for subsequent requests
        cy.wrap(token).as('authToken');
        
        cy.addTestLog('Login successful, token stored', 'info');
        return token;
      } else {
        throw new Error(`Login failed: ${response.status} - ${JSON.stringify(response.body)}`);
      }
    });
  }

  static setAuthToken(token: string): void {
    cy.wrap(token).as('authToken');
    cy.addTestLog('Auth token set', 'info');
  }

  static getAuthHeaders(): Cypress.Chainable<Record<string, string>> {
    return cy.get('@authToken').then((token: string) => {
      return {
        'Authorization': `Bearer ${token}`
      };
    });
  }

  static authenticatedGet(url: string, headers: Record<string, string> = {}, options: any = {}): Cypress.Chainable<ApiResponse> {
    return this.getAuthHeaders().then((authHeaders) => {
      const mergedHeaders = { ...headers, ...authHeaders };
      return this.get(url, mergedHeaders, options);
    });
  }

  static authenticatedPost(url: string, body?: any, headers: Record<string, string> = {}, options: any = {}): Cypress.Chainable<ApiResponse> {
    return this.getAuthHeaders().then((authHeaders) => {
      const mergedHeaders = { ...headers, ...authHeaders };
      return this.post(url, body, mergedHeaders, options);
    });
  }

  static authenticatedPut(url: string, body?: any, headers: Record<string, string> = {}, options: any = {}): Cypress.Chainable<ApiResponse> {
    return this.getAuthHeaders().then((authHeaders) => {
      const mergedHeaders = { ...headers, ...authHeaders };
      return this.put(url, body, mergedHeaders, options);
    });
  }

  static authenticatedPatch(url: string, body?: any, headers: Record<string, string> = {}, options: any = {}): Cypress.Chainable<ApiResponse> {
    return this.getAuthHeaders().then((authHeaders) => {
      const mergedHeaders = { ...headers, ...authHeaders };
      return this.patch(url, body, mergedHeaders, options);
    });
  }

  static authenticatedDelete(url: string, headers: Record<string, string> = {}, options: any = {}): Cypress.Chainable<ApiResponse> {
    return this.getAuthHeaders().then((authHeaders) => {
      const mergedHeaders = { ...headers, ...authHeaders };
      return this.delete(url, mergedHeaders, options);
    });
  }

  // Response validation methods
  static validateStatus(response: ApiResponse, expectedStatus: number): Cypress.Chainable<ApiResponse> {
    cy.addTestLog(`Validating status: expected ${expectedStatus}, got ${response.status}`, 'info');
    
    if (response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, but got ${response.status}`);
    }
    
    return cy.wrap(response);
  }

  static validateStatusRange(response: ApiResponse, minStatus: number, maxStatus: number): Cypress.Chainable<ApiResponse> {
    cy.addTestLog(`Validating status range: ${minStatus}-${maxStatus}, got ${response.status}`, 'info');
    
    if (response.status < minStatus || response.status > maxStatus) {
      throw new Error(`Expected status between ${minStatus} and ${maxStatus}, but got ${response.status}`);
    }
    
    return cy.wrap(response);
  }

  static validateResponseTime(response: ApiResponse, maxDuration: number): Cypress.Chainable<ApiResponse> {
    cy.addTestLog(`Validating response time: ${response.duration}ms (max: ${maxDuration}ms)`, 'info');
    
    if (response.duration > maxDuration) {
      cy.addTestLog(`Response time exceeded: ${response.duration}ms > ${maxDuration}ms`, 'warn');
    }
    
    return cy.wrap(response);
  }

  static validateJsonSchema(response: ApiResponse, schema: any): Cypress.Chainable<ApiResponse> {
    cy.addTestLog('Validating JSON schema', 'info');
    
    // This would typically use a JSON schema validation library
    // For now, we'll do basic structure validation
    if (typeof response.body !== 'object') {
      throw new Error('Response body is not a valid JSON object');
    }
    
    return cy.wrap(response);
  }

  static validateResponseBody(response: ApiResponse, expectedBody: any): Cypress.Chainable<ApiResponse> {
    cy.addTestLog('Validating response body', 'info');
    
    expect(response.body).to.deep.equal(expectedBody);
    
    return cy.wrap(response);
  }

  static validateResponseContains(response: ApiResponse, key: string, value?: any): Cypress.Chainable<ApiResponse> {
    cy.addTestLog(`Validating response contains key: ${key}`, 'info');
    
    if (!(key in response.body)) {
      throw new Error(`Response body does not contain key: ${key}`);
    }
    
    if (value !== undefined && response.body[key] !== value) {
      throw new Error(`Expected ${key} to be ${value}, but got ${response.body[key]}`);
    }
    
    return cy.wrap(response);
  }

  static validateArrayLength(response: ApiResponse, arrayKey: string, expectedLength: number): Cypress.Chainable<ApiResponse> {
    cy.addTestLog(`Validating array length for key: ${arrayKey}`, 'info');
    
    if (!Array.isArray(response.body[arrayKey])) {
      throw new Error(`${arrayKey} is not an array`);
    }
    
    const actualLength = response.body[arrayKey].length;
    if (actualLength !== expectedLength) {
      throw new Error(`Expected array length ${expectedLength}, but got ${actualLength}`);
    }
    
    return cy.wrap(response);
  }

  // Utility methods
  static waitForApiResponse(url: string, expectedStatus: number = 200, maxAttempts: number = 10, delay: number = 1000): Cypress.Chainable<ApiResponse> {
    cy.addTestLog(`Waiting for API response from: ${url}`, 'info');
    
    let attempts = 0;
    
    const checkApi = (): Cypress.Chainable<ApiResponse> => {
      attempts++;
      
      return this.get(url).then((response) => {
        if (response.status === expectedStatus || attempts >= maxAttempts) {
          return response;
        }
        
        cy.wait(delay);
        return checkApi();
      });
    };
    
    return checkApi();
  }

  static pollUntilCondition(
    url: string, 
    conditionFn: (response: ApiResponse) => boolean, 
    maxAttempts: number = 10, 
    delay: number = 2000
  ): Cypress.Chainable<ApiResponse> {
    cy.addTestLog(`Polling API until condition is met: ${url}`, 'info');
    
    let attempts = 0;
    
    const poll = (): Cypress.Chainable<ApiResponse> => {
      attempts++;
      
      return this.get(url).then((response) => {
        if (conditionFn(response) || attempts >= maxAttempts) {
          return response;
        }
        
        cy.wait(delay);
        return poll();
      });
    };
    
    return poll();
  }

  static uploadFile(url: string, filePath: string, fieldName: string = 'file', headers: Record<string, string> = {}): Cypress.Chainable<ApiResponse> {
    cy.addTestLog(`Uploading file: ${filePath} to ${url}`, 'info');
    
    return cy.fixture(filePath, 'base64').then((fileContent) => {
      const formData = new FormData();
      const blob = Cypress.Blob.base64StringToBlob(fileContent);
      formData.append(fieldName, blob, filePath);
      
      const requestOptions = {
        method: 'POST',
        url,
        body: formData,
        headers: {
          ...headers
          // Content-Type will be set automatically for FormData
        },
        timeout: this.defaultTimeout * 2, // Longer timeout for file uploads
        failOnStatusCode: false
      };

      return cy.request(requestOptions).then((response) => {
        const apiResponse: ApiResponse = {
          status: response.status,
          body: response.body,
          headers: response.headers,
          duration: response.duration
        };

        cy.addTestLog(`File upload response: ${response.status} (${response.duration}ms)`, 'info');
        return apiResponse;
      });
    });
  }

  static downloadFile(url: string, headers: Record<string, string> = {}): Cypress.Chainable<Blob> {
    cy.addTestLog(`Downloading file from: ${url}`, 'info');
    
    const mergedHeaders = { ...this.baseHeaders, ...headers };
    
    return cy.request({
      method: 'GET',
      url,
      headers: mergedHeaders,
      encoding: 'binary',
      timeout: this.defaultTimeout * 2
    }).then((response) => {
      cy.addTestLog(`File downloaded: ${response.status} (${response.duration}ms)`, 'info');
      return new Blob([response.body]);
    });
  }

  static setBaseUrl(baseUrl: string): void {
    cy.addTestLog(`Setting API base URL: ${baseUrl}`, 'info');
    Cypress.config('baseUrl', baseUrl);
  }

  static setDefaultTimeout(timeout: number): void {
    cy.addTestLog(`Setting default API timeout: ${timeout}ms`, 'info');
    this.defaultTimeout = timeout;
  }

  static setDefaultHeaders(headers: Record<string, string>): void {
    cy.addTestLog('Setting default API headers', 'info');
    this.baseHeaders = { ...this.baseHeaders, ...headers };
  }

  // Performance testing methods
  static measureApiPerformance(url: string, iterations: number = 5): Cypress.Chainable<any> {
    cy.addTestLog(`Measuring API performance for ${url} (${iterations} iterations)`, 'info');
    
    const results: number[] = [];
    
    const runIteration = (remaining: number): Cypress.Chainable<any> => {
      if (remaining <= 0) {
        const average = results.reduce((sum, time) => sum + time, 0) / results.length;
        const min = Math.min(...results);
        const max = Math.max(...results);
        
        const performanceResult = {
          url,
          iterations,
          average,
          min,
          max,
          results
        };
        
        cy.addTestLog(`API Performance Results - Avg: ${average.toFixed(2)}ms, Min: ${min}ms, Max: ${max}ms`, 'info');
        
        return cy.wrap(performanceResult);
      }
      
      return this.get(url).then((response) => {
        results.push(response.duration);
        return runIteration(remaining - 1);
      });
    };
    
    return runIteration(iterations);
  }

  // Load testing simulation
  static simulateLoad(url: string, concurrentRequests: number = 5, totalRequests: number = 25): Cypress.Chainable<any> {
    cy.addTestLog(`Simulating load: ${totalRequests} requests with ${concurrentRequests} concurrent`, 'info');
    
    const results: ApiResponse[] = [];
    let completed = 0;
    
    const makeRequest = (): Cypress.Chainable<ApiResponse> => {
      return this.get(url).then((response) => {
        results.push(response);
        completed++;
        return response;
      });
    };
    
    const batch = Array(Math.min(concurrentRequests, totalRequests)).fill(null).map(() => makeRequest());
    
    return cy.wrap(Promise.all(batch)).then(() => {
      if (completed < totalRequests) {
        return this.simulateLoad(url, concurrentRequests, totalRequests - completed).then((nextResults) => {
          return {
            totalRequests,
            concurrentRequests,
            results: [...results, ...nextResults.results],
            averageResponseTime: [...results, ...nextResults.results].reduce((sum, r) => sum + r.duration, 0) / (results.length + nextResults.results.length)
          };
        });
      }
      
      return {
        totalRequests,
        concurrentRequests,
        results,
        averageResponseTime: results.reduce((sum, r) => sum + r.duration, 0) / results.length
      };
    });
  }
}