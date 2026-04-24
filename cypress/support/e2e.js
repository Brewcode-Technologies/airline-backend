import './commands';

// Runs once before ALL spec files — ensure cypress admin exists
before(() => {
  cy.request({
    method: 'POST',
    url: '/api/auth/register',
    body: {
      name: 'Cypress Admin',
      email: Cypress.env('adminEmail'),
      password: Cypress.env('adminPassword'),
      role: 'admin',
    },
    failOnStatusCode: false,
  }).then(() => {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: Cypress.env('adminEmail'),
        password: Cypress.env('adminPassword'),
      },
    }).then(({ body }) => {
      Cypress.env('token', body.data.token);
      Cypress.env('userId', body.data.user.id);
    });
  });
});
