module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    'cypress/globals': true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:cypress/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint',
    'cypress'
  ],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-var-requires': 'error',
    
    // General ESLint rules
    'no-console': 'warn',
    'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-var': 'error',
    
    // Cypress specific rules
    'cypress/no-assigning-return-values': 'error',
    'cypress/no-unnecessary-waiting': 'warn',
    'cypress/assertion-before-screenshot': 'warn',
    'cypress/no-force': 'warn',
    'cypress/no-async-tests': 'error',
    'cypress/no-pause': 'error'
  },
  overrides: [
    {
      files: ['**/*.spec.ts', '**/*.test.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off'
      }
    }
  ]
};