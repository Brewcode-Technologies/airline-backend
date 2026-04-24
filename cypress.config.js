const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5000',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    env: {
      adminEmail: 'cypress_admin@test.com',
      adminPassword: 'password123',
    },
  },
});
