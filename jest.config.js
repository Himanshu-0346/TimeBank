// jest.config.js
// Jest configuration for TimeBank Project testing

module.exports = {
  // Node environment (not browser)
  testEnvironment: 'node',

  // Test files pattern
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Exclude node_modules
  testPathIgnorePatterns: ['/node_modules/'],

  // Collect code coverage
  collectCoverageFrom: [
    'controllers/**/*.js',
    'services/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
    '!**/__tests__/**'
  ],

  // Coverage thresholds - WHAT IT DOES: Fails if coverage below these %
  coverageThreshold: {
    global: {
      branches: 50,      // At least 50% of branches tested
      functions: 50,     // At least 50% of functions tested
      lines: 50,         // At least 50% of lines tested
      statements: 50     // At least 50% of statements tested
    }
  },

  // Test timeout (ms)
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Transform files (if using ES6)
  // transform: {
  //   '^.+\\.jsx?$': 'babel-jest',
  // },

  // Module name mapper for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Notify on completion
  notify: false,
  notifyMode: 'failure-change'
};
