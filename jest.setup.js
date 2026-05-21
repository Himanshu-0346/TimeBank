// jest.setup.js
// Jest setup file - runs before all tests

// jest.setup.js
// Jest setup file - runs before all tests

// Set test environment variable
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/timebank_test';

// Suppress console output in tests (optional)
// global.console = {
//   log: jest.fn(),
//   error: jest.fn(),
//   warn: jest.fn(),
// };
