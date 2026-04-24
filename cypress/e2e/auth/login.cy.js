describe('Auth - Login API', () => {
  before(() => cy.loginAsAdmin());

  it('TC01 - logs in with valid credentials', () => {
    cy.request('POST', '/api/auth/login', { email: Cypress.env('adminEmail'), password: Cypress.env('adminPassword') })
      .then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body.success).to.be.true;
      });
  });

  it('TC02 - returns token on login', () => {
    cy.request('POST', '/api/auth/login', { email: Cypress.env('adminEmail'), password: Cypress.env('adminPassword') })
      .then(({ body }) => {
        expect(body.data.token).to.be.a('string');
        expect(body.data.token.length).to.be.greaterThan(10);
      });
  });

  it('TC03 - returns user object on login', () => {
    cy.request('POST', '/api/auth/login', { email: Cypress.env('adminEmail'), password: Cypress.env('adminPassword') })
      .then(({ body }) => expect(body.data.user).to.have.all.keys('id', 'name', 'email', 'role'));
  });

  it('TC04 - does not return password in response', () => {
    cy.request('POST', '/api/auth/login', { email: Cypress.env('adminEmail'), password: Cypress.env('adminPassword') })
      .then(({ body }) => expect(body.data.user).to.not.have.property('password'));
  });

  it('TC05 - fails with wrong password', () => {
    cy.request({ method: 'POST', url: '/api/auth/login', body: { email: Cypress.env('adminEmail'), password: 'wrongpassword' }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC06 - fails with non-existent email', () => {
    cy.request({ method: 'POST', url: '/api/auth/login', body: { email: 'nobody@nowhere.com', password: 'password123' }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC07 - fails without email', () => {
    cy.request({ method: 'POST', url: '/api/auth/login', body: { password: 'password123' }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.be.oneOf([400, 401, 422, 500]));
  });

  it('TC08 - fails without password', () => {
    cy.request({ method: 'POST', url: '/api/auth/login', body: { email: Cypress.env('adminEmail') }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.be.oneOf([400, 401, 422, 500]));
  });

  it('TC09 - fails with empty body', () => {
    cy.request({ method: 'POST', url: '/api/auth/login', body: {}, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.be.oneOf([400, 401, 422, 500]));
  });

  it('TC10 - fails with invalid email format', () => {
    cy.request({ method: 'POST', url: '/api/auth/login', body: { email: 'not-valid', password: 'password123' }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.be.oneOf([400, 401, 422, 500]));
  });

  it('TC11 - response has correct content-type', () => {
    cy.request('POST', '/api/auth/login', { email: Cypress.env('adminEmail'), password: Cypress.env('adminPassword') })
      .then((res) => expect(res.headers['content-type']).to.include('application/json'));
  });

  it('TC12 - token is valid JWT format (3 parts)', () => {
    cy.request('POST', '/api/auth/login', { email: Cypress.env('adminEmail'), password: Cypress.env('adminPassword') })
      .then(({ body }) => expect(body.data.token.split('.')).to.have.length(3));
  });

  it('TC13 - user role is returned correctly', () => {
    cy.request('POST', '/api/auth/login', { email: Cypress.env('adminEmail'), password: Cypress.env('adminPassword') })
      .then(({ body }) => expect(['admin', 'airline', 'driver']).to.include(body.data.user.role));
  });

  it('TC14 - fails with empty email string', () => {
    cy.request({ method: 'POST', url: '/api/auth/login', body: { email: '', password: 'password123' }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.be.oneOf([400, 401, 422, 500]));
  });

  it('TC15 - fails with empty password string', () => {
    cy.request({ method: 'POST', url: '/api/auth/login', body: { email: Cypress.env('adminEmail'), password: '' }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.be.oneOf([400, 401, 422, 500]));
  });
});
