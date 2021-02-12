const Config = require('config');

module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
  verbose: true,
  globals: {
    __TEST_REDIS_URL__: Config.get('REDIS_URL'),
  },
};
