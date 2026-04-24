describe('Auth - Me API', () => {
  before(() => cy.loginAsAdmin());

  it('TC01 - returns current user profile', () => {
    cy.authRequest({ method: 'GET', url: '/api/auth/me' })
      .then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body.success).to.be.true;
      });
  });

  it('TC02 - returns correct email', () => {
    cy.authRequest({ method: 'GET', url: '/api/auth/me' })
      .then(({ body }) => expect(body.data.email).to.eq(Cypress.env('adminEmail')));
  });

  it('TC03 - does not return password', () => {
    cy.authRequest({ method: 'GET', url: '/api/auth/me' })
      .then(({ body }) => expect(body.data).to.not.have.property('password'));
  });

  it('TC04 - returns _id field', () => {
    cy.authRequest({ method: 'GET', url: '/api/auth/me' })
      .then(({ body }) => expect(body.data).to.have.property('_id'));
  });

  it('TC05 - returns name field', () => {
    cy.authRequest({ method: 'GET', url: '/api/auth/me' })
      .then(({ body }) => expect(body.data).to.have.property('name'));
  });

  it('TC06 - returns role field', () => {
    cy.authRequest({ method: 'GET', url: '/api/auth/me' })
      .then(({ body }) => expect(['admin', 'airline', 'driver']).to.include(body.data.role));
  });

  it('TC07 - returns createdAt field', () => {
    cy.authRequest({ method: 'GET', url: '/api/auth/me' })
      .then(({ body }) => expect(body.data).to.have.property('createdAt'));
  });

  it('TC08 - fails without token', () => {
    cy.request({ method: 'GET', url: '/api/auth/me', failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC09 - fails with invalid token', () => {
    cy.request({ method: 'GET', url: '/api/auth/me', headers: { Authorization: 'Bearer invalidtoken123' }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC10 - fails with malformed Bearer header', () => {
    cy.request({ method: 'GET', url: '/api/auth/me', headers: { Authorization: 'NotBearer sometoken' }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC11 - fails with tampered token', () => {
    cy.request({ method: 'GET', url: '/api/auth/me', headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ImZha2UifQ.fakesig' }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC12 - response has correct content-type', () => {
    cy.authRequest({ method: 'GET', url: '/api/auth/me' })
      .then((res) => expect(res.headers['content-type']).to.include('application/json'));
  });

  it('TC13 - success field is true', () => {
    cy.authRequest({ method: 'GET', url: '/api/auth/me' })
      .then(({ body }) => expect(body.success).to.be.true);
  });

  it('TC14 - data is an object not array', () => {
    cy.authRequest({ method: 'GET', url: '/api/auth/me' })
      .then(({ body }) => expect(body.data).to.be.an('object').and.not.be.an('array'));
  });

  it('TC15 - fails with empty Authorization header', () => {
    cy.request({ method: 'GET', url: '/api/auth/me', headers: { Authorization: '' }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });
});
