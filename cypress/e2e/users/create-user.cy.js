describe('Users - Create User API', () => {
  before(() => cy.loginAsAdmin());

  const newUser = () => ({
    name: 'Cypress New User',
    email: `cy_user_${Date.now()}@test.com`,
    password: 'password123',
    role: 'airline',
  });

  it('TC01 - POST /api/users creates user and returns 201', () => {
    cy.authRequest({ method: 'POST', url: '/api/users', body: newUser() })
      .then(({ status, body }) => {
        expect(status).to.eq(201);
        expect(body.data).to.have.property('_id');
      });
  });

  it('TC02 - POST /api/users returns correct email', () => {
    const user = newUser();
    cy.authRequest({ method: 'POST', url: '/api/users', body: user })
      .then(({ body }) => expect(body.data.email).to.eq(user.email));
  });

  it('TC03 - POST /api/users does not return password', () => {
    cy.authRequest({ method: 'POST', url: '/api/users', body: newUser() })
      .then(({ body }) => expect(body.data).to.not.have.property('password'));
  });

  it('TC04 - POST /api/users with role admin', () => {
    cy.authRequest({ method: 'POST', url: '/api/users', body: { ...newUser(), role: 'admin' } })
      .then(({ status, body }) => {
        expect(status).to.eq(201);
        expect(body.data.role).to.eq('admin');
      });
  });

  it('TC05 - POST /api/users with role driver', () => {
    cy.authRequest({ method: 'POST', url: '/api/users', body: { ...newUser(), role: 'driver' } })
      .then(({ status, body }) => {
        expect(status).to.eq(201);
        expect(body.data.role).to.eq('driver');
      });
  });

  it('TC06 - POST /api/users fails with duplicate email', () => {
    const user = newUser();
    cy.authRequest({ method: 'POST', url: '/api/users', body: user });
    cy.authRequest({ method: 'POST', url: '/api/users', body: user })
      .then(({ status }) => expect(status).to.be.oneOf([400, 409, 500]));
  });

  it('TC07 - POST /api/users fails without email', () => {
    cy.authRequest({ method: 'POST', url: '/api/users', body: { name: 'No Email', password: 'password123' } })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500]));
  });

  it('TC08 - POST /api/users fails without password', () => {
    cy.authRequest({ method: 'POST', url: '/api/users', body: { name: 'No Pass', email: `nopass_${Date.now()}@test.com` } })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500]));
  });

  it('TC09 - POST /api/users fails without name', () => {
    cy.authRequest({ method: 'POST', url: '/api/users', body: { email: `noname_${Date.now()}@test.com`, password: 'password123' } })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500]));
  });

  it('TC10 - POST /api/users fails with invalid email format', () => {
    cy.authRequest({ method: 'POST', url: '/api/users', body: { name: 'Bad Email', email: 'not-valid', password: 'password123' } })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500]));
  });

  it('TC11 - POST /api/users fails with short password', () => {
    cy.authRequest({ method: 'POST', url: '/api/users', body: { name: 'Short', email: `short_${Date.now()}@test.com`, password: '123' } })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500]));
  });

  it('TC12 - POST /api/users blocked without token', () => {
    cy.request({ method: 'POST', url: '/api/users', body: newUser(), failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC13 - POST /api/users with invalid role', () => {
    cy.authRequest({ method: 'POST', url: '/api/users', body: { ...newUser(), role: 'superuser' } })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500]));
  });

  it('TC14 - POST /api/users returns createdAt timestamp', () => {
    cy.authRequest({ method: 'POST', url: '/api/users', body: newUser() })
      .then(({ body }) => expect(body.data).to.have.property('createdAt'));
  });

  it('TC15 - POST /api/users response has success true', () => {
    cy.authRequest({ method: 'POST', url: '/api/users', body: newUser() })
      .then(({ body }) => expect(body.success).to.be.true);
  });
});
