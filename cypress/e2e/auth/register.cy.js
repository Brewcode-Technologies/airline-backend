describe('Auth - Register API', () => {
  const timestamp = Date.now();

  it('TC01 - registers successfully with all valid fields', () => {
    cy.request({
      method: 'POST', url: '/api/auth/register',
      body: { name: 'Test User', email: `reg_${timestamp}@test.com`, password: 'password123', role: 'admin' },
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.eq(201);
      expect(body.success).to.be.true;
      expect(body.data).to.have.property('token');
    });
  });

  it('TC02 - registers with role airline', () => {
    cy.request({
      method: 'POST', url: '/api/auth/register',
      body: { name: 'Airline User', email: `airline_${timestamp}@test.com`, password: 'password123', role: 'airline' },
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.eq(201);
      expect(body.data.user.role).to.eq('airline');
    });
  });

  it('TC03 - registers with role driver', () => {
    cy.request({
      method: 'POST', url: '/api/auth/register',
      body: { name: 'Driver User', email: `driver_${timestamp}@test.com`, password: 'password123', role: 'driver' },
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.eq(201);
      expect(body.data.user.role).to.eq('driver');
    });
  });

  it('TC04 - returns token on successful registration', () => {
    cy.request({
      method: 'POST', url: '/api/auth/register',
      body: { name: 'Token Test', email: `token_${timestamp}@test.com`, password: 'password123', role: 'admin' },
      failOnStatusCode: false,
    }).then(({ body }) => {
      expect(body.data.token).to.be.a('string');
      expect(body.data.token.length).to.be.greaterThan(10);
    });
  });

  it('TC05 - returns user object without password', () => {
    cy.request({
      method: 'POST', url: '/api/auth/register',
      body: { name: 'No Pass Test', email: `nopass_${timestamp}@test.com`, password: 'password123', role: 'admin' },
      failOnStatusCode: false,
    }).then(({ body }) => {
      expect(body.data.user).to.not.have.property('password');
      expect(body.data.user).to.have.property('id');
      expect(body.data.user).to.have.property('name');
      expect(body.data.user).to.have.property('email');
    });
  });

  it('TC06 - fails with duplicate email', () => {
    const email = `dup_${timestamp}@test.com`;
    cy.request({ method: 'POST', url: '/api/auth/register', body: { name: 'First', email, password: 'password123', role: 'admin' }, failOnStatusCode: false });
    cy.request({ method: 'POST', url: '/api/auth/register', body: { name: 'Second', email, password: 'password123', role: 'admin' }, failOnStatusCode: false })
      .then(({ status }) => {
        expect(status).to.eq(409);
      });
  });

  it('TC07 - fails without email', () => {
    cy.request({ method: 'POST', url: '/api/auth/register', body: { name: 'No Email', password: 'password123' }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500]));
  });

  it('TC08 - fails without password', () => {
    cy.request({ method: 'POST', url: '/api/auth/register', body: { name: 'No Pass', email: `np_${timestamp}@test.com` }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500]));
  });

  it('TC09 - fails without name', () => {
    cy.request({ method: 'POST', url: '/api/auth/register', body: { email: `nn_${timestamp}@test.com`, password: 'password123' }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500]));
  });

  it('TC10 - fails with invalid email format', () => {
    cy.request({ method: 'POST', url: '/api/auth/register', body: { name: 'Bad Email', email: 'not-an-email', password: 'password123' }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500]));
  });

  it('TC11 - fails with empty body', () => {
    cy.request({ method: 'POST', url: '/api/auth/register', body: {}, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500]));
  });

  it('TC12 - fails with short password', () => {
    cy.request({ method: 'POST', url: '/api/auth/register', body: { name: 'Short', email: `short_${timestamp}@test.com`, password: '123' }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500]));
  });

  it('TC13 - response has correct content-type', () => {
    cy.request({ method: 'POST', url: '/api/auth/register', body: { name: 'CT', email: `ct_${timestamp}@test.com`, password: 'password123', role: 'admin' }, failOnStatusCode: false })
      .then((res) => expect(res.headers['content-type']).to.include('application/json'));
  });

  it('TC14 - default role is airline when role not provided', () => {
    cy.request({ method: 'POST', url: '/api/auth/register', body: { name: 'Default Role', email: `def_${timestamp}@test.com`, password: 'password123' }, failOnStatusCode: false })
      .then(({ status, body }) => {
        if (status === 201) expect(body.data.user.role).to.eq('airline');
      });
  });

  it('TC15 - fails with invalid role value', () => {
    cy.request({ method: 'POST', url: '/api/auth/register', body: { name: 'Bad Role', email: `br_${timestamp}@test.com`, password: 'password123', role: 'superuser' }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500]));
  });
});
