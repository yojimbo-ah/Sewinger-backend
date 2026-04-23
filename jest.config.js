export default {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  transform: {},
  collectCoverageFrom: [
    'controllers/**/*.js',
    'routes/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {
    '^cloudinary$': '<rootDir>/__mocks__/cloudinary.js',
    '^../service/huggingface-ai\\.js$': '<rootDir>/__mocks__/huggingface-ai.js',
  },
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
};
