module.exports = {
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text-summary'],
  testEnvironment: 'node',
  collectCoverageFrom: [
    /**
     * Accept this files
     */
    '**/lib/*.{js}',
    /**
     * Ignore the following files
     */
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
};
