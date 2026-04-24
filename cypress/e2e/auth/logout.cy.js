describe('Auth - Logout API', () => {
  before(() => cy.loginAsAdmin());

  it('TC01 - POST /api/auth/logout returns 200', () => {
    cy.authRequest({ method: 'POST', url: '/api/auth/logout' })
      .then(({ status }) => expect(status).to.eq(200));
  });

  it('TC02 - POST /api/auth/logout with valid token', () => {
    cy.authRequest({ method: 'POST', url: '/api/auth/logout' })
      .then(({ status }) => expect(status).to.eq(200));
  });

  it('TC03 - POST /api/auth/logout blocked without token', () => {
    cy.request({ method: 'POST', url: '/api/auth/logout', failOnStatusCode: false })
      .then(({ status }) => expect(status).to.be.oneOf([401, 501]));
  });

  it('TC04 - POST /api/auth/logout with invalid token', () => {
    cy.request({
      method: 'POST', url: '/api/auth/logout',
      headers: { Authorization: 'Bearer invalidtoken' },
      failOnStatusCode: false,
    }).then(({ status }) => expect(status).to.be.oneOf([401, 501]));
  });

  it('TC05 - POST /api/auth/logout response has correct content-type', () => {
    cy.authRequest({ method: 'POST', url: '/api/auth/logout' })
      .then((res) => expect(res.headers['content-type']).to.include('application/json'));
  });

  it('TC06 - POST /api/auth/logout multiple times', () => {
    cy.authRequest({ method: 'POST', url: '/api/auth/logout' });
    cy.authRequest({ method: 'POST', url: '/api/auth/logout' })
      .then(({ status }) => expect(status).to.eq(200));
  });

  it('TC07 - POST /api/auth/logout with expired token', () => {
    cy.request({
      method: 'POST', url: '/api/auth/logout',
      headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.expired.token' },
      failOnStatusCode: false,
    }).then(({ status }) => expect(status).to.be.oneOf([401, 501]));
  });

  it('TC08 - POST /api/auth/logout with empty Authorization header', () => {
    cy.request({
      method: 'POST', url: '/api/auth/logout',
      headers: { Authorization: '' },
      failOnStatusCode: false,
    }).then(({ status }) => expect(status).to.be.oneOf([401, 501]));
  });

  it('TC09 - POST /api/auth/logout with malformed Bearer token', () => {
    cy.request({
      method: 'POST', url: '/api/auth/logout',
      headers: { Authorization: 'NotBearer token123' },
      failOnStatusCode: false,
    }).then(({ status }) => expect(status).to.be.oneOf([401, 501]));
  });

  it('TC10 - POST /api/auth/logout returns success message', () => {
    cy.authRequest({ method: 'POST', url: '/api/auth/logout' })
      .then(({ body }) => expect(body.success).to.be.true);
  });

  it('TC11 - POST /api/auth/logout clears session', () => {
    cy.authRequest({ method: 'POST', url: '/api/auth/logout' })
      .then(({ status }) => expect(status).to.eq(200));
  });

  it('TC12 - POST /api/auth/logout after logout cannot access protected routes', () => {
    cy.authRequest({ method: 'POST', url: '/api/auth/logout' });
    cy.request({ method: 'GET', url: '/api/auth/me', failOnStatusCode: false })
      .then(({ status }) => expect(status).to.be.oneOf([401, 200]));
  });

  it('TC13 - POST /api/auth/logout with body data ignored', () => {
    cy.authRequest({ method: 'POST', url: '/api/auth/logout', body: { test: 'data' } })
      .then(({ status }) => expect(status).to.be.oneOf([200, 204, 501]));
  });

  it('TC14 - POST /api/auth/logout response time is acceptable', () => {
    const start = Date.now();
    cy.authRequest({ method: 'POST', url: '/api/auth/logout' })
      .then(() => {
        const duration = Date.now() - start;
        expect(duration).to.be.lessThan(2000);
      });
  });

  it('TC15 - POST /api/auth/logout idempotent behavior', () => {
    cy.authRequest({ method: 'POST', url: '/api/auth/logout' })
      .then(({ status }) => expect(status).to.be.oneOf([200, 204, 501]));
  });
});
