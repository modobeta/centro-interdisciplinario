/** Separa pruebas rápidas, de integración y de concurrencia para ejecutar sólo el costo necesario. */
const common = {
  testEnvironment: 'node',
  clearMocks: true,
  restoreMocks: true,
  setupFiles: ['<rootDir>/tests/helpers/setup-env.js'],
  testTimeout: 15000
};

module.exports = {
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/shared/database/models/index.js'
  ],
  coverageDirectory: 'coverage',
  projects: [
    {
      ...common,
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js']
    },
    {
      ...common,
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.js']
    },
    {
      ...common,
      displayName: 'concurrency',
      testMatch: ['<rootDir>/tests/concurrency/**/*.test.js'],
      testTimeout: 30000
    }
  ]
};
