// Register + Login and save token + userId
Cypress.Commands.add('loginAsAdmin', () => {
  // First ensure cypress admin user exists
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
  });

  // Then login and store token
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

// Authenticated request helper — always uses latest token
Cypress.Commands.add('authRequest', (options) => {
  return cy.request({
    ...options,
    headers: {
      Authorization: `Bearer ${Cypress.env('token')}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    failOnStatusCode: false,
  });
});
