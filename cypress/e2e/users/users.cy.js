describe('Users API', () => {
  before(() => cy.loginAsAdmin());

  it('TC01 - GET /api/users returns 200', () => {
    cy.authRequest({ method: 'GET', url: '/api/users' })
      .then(({ status }) => expect(status).to.eq(200));
  });

  it('TC02 - GET /api/users returns array', () => {
    cy.authRequest({ method: 'GET', url: '/api/users' })
      .then(({ body }) => expect(body.data).to.be.an('array'));
  });

  it('TC03 - GET /api/users has at least one user', () => {
    cy.authRequest({ method: 'GET', url: '/api/users' })
      .then(({ body }) => expect(body.data.length).to.be.greaterThan(0));
  });

  it('TC04 - GET /api/users no passwords in list', () => {
    cy.authRequest({ method: 'GET', url: '/api/users' })
      .then(({ body }) => body.data.forEach(u => expect(u).to.not.have.property('password')));
  });

  it('TC05 - GET /api/users each user has required fields', () => {
    cy.authRequest({ method: 'GET', url: '/api/users' })
      .then(({ body }) => {
        body.data.forEach(u => {
          expect(u).to.have.property('_id');
          expect(u).to.have.property('name');
          expect(u).to.have.property('email');
          expect(u).to.have.property('role');
        });
      });
  });

  it('TC06 - GET /api/users blocked without token', () => {
    cy.request({ method: 'GET', url: '/api/users', failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC07 - GET /api/users/:id returns correct user', () => {
    cy.authRequest({ method: 'GET', url: `/api/users/${Cypress.env('userId')}` })
      .then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body.data._id).to.eq(Cypress.env('userId'));
      });
  });

  it('TC08 - GET /api/users/:id does not return password', () => {
    cy.authRequest({ method: 'GET', url: `/api/users/${Cypress.env('userId')}` })
      .then(({ body }) => expect(body.data).to.not.have.property('password'));
  });

  it('TC09 - GET /api/users/:id returns email field', () => {
    cy.authRequest({ method: 'GET', url: `/api/users/${Cypress.env('userId')}` })
      .then(({ body }) => expect(body.data).to.have.property('email'));
  });

  it('TC10 - GET /api/users/:id returns role field', () => {
    cy.authRequest({ method: 'GET', url: `/api/users/${Cypress.env('userId')}` })
      .then(({ body }) => expect(['admin', 'airline', 'driver']).to.include(body.data.role));
  });

  it('TC11 - GET /api/users/:id with invalid id returns error', () => {
    cy.authRequest({ method: 'GET', url: '/api/users/invalidid123' })
      .then(({ status }) => expect(status).to.be.oneOf([400, 404, 500]));
  });

  it('TC12 - GET /api/users/:id with non-existent id', () => {
    cy.authRequest({ method: 'GET', url: '/api/users/64f1a2b3c4d5e6f7a8b9c0d1' })
      .then(({ status }) => expect(status).to.be.oneOf([200, 404]));
  });

  it('TC13 - PUT /api/users/:id updates name', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/users/${Cypress.env('userId')}`,
      body: { name: 'Cypress Admin Updated' },
    }).then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.data.name).to.eq('Cypress Admin Updated');
    });
  });

  it('TC14 - PUT /api/users/:id blocked without token', () => {
    cy.request({
      method: 'PUT', url: `/api/users/${Cypress.env('userId')}`,
      body: { name: 'Hacker' }, failOnStatusCode: false,
    }).then(({ status }) => expect(status).to.eq(401));
  });

  it('TC15 - PUT /api/users/:id with invalid id returns error', () => {
    cy.authRequest({ method: 'PUT', url: '/api/users/invalidid123', body: { name: 'Test' } })
      .then(({ status }) => expect(status).to.be.oneOf([400, 404, 500]));
  });

  it('TC16 - GET /api/users response has success true', () => {
    cy.authRequest({ method: 'GET', url: '/api/users' })
      .then(({ body }) => expect(body.success).to.be.true);
  });
});
