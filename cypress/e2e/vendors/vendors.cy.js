describe('Vendors API', () => {
  before(() => cy.loginAsAdmin());

  const newVendor = () => ({
    name: 'Cypress Vendor',
    email: `vendor_${Date.now()}@test.com`,
    contact: '9876543210',
    address: '123 Vendor Street',
  });

  it('TC01 - GET /api/vendors returns 200', () => {
    cy.authRequest({ method: 'GET', url: '/api/vendors' })
      .then(({ status }) => expect(status).to.eq(200));
  });

  it('TC02 - GET /api/vendors returns array', () => {
    cy.authRequest({ method: 'GET', url: '/api/vendors' })
      .then(({ body }) => expect(body.data).to.be.an('array'));
  });

  it('TC03 - GET /api/vendors has seed vendors', () => {
    cy.authRequest({ method: 'GET', url: '/api/vendors' })
      .then(({ body }) => expect(body.data.length).to.be.greaterThan(0));
  });

  it('TC04 - GET /api/vendors blocked without token', () => {
    cy.request({ method: 'GET', url: '/api/vendors', failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC05 - POST /api/vendors creates vendor and returns 201', () => {
    cy.authRequest({ method: 'POST', url: '/api/vendors', body: newVendor() })
      .then(({ status, body }) => {
        expect(status).to.eq(201);
        expect(body.data).to.have.property('_id');
        Cypress.env('vendorId', body.data._id);
      });
  });

  it('TC06 - POST /api/vendors returns correct name', () => {
    cy.authRequest({ method: 'POST', url: '/api/vendors', body: newVendor() })
      .then(({ body }) => expect(body.data.name).to.eq('Cypress Vendor'));
  });

  it('TC07 - POST /api/vendors fails without name', () => {
    cy.authRequest({ method: 'POST', url: '/api/vendors', body: { email: `v_${Date.now()}@test.com` } })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500]));
  });

  it('TC08 - POST /api/vendors blocked without token', () => {
    cy.request({ method: 'POST', url: '/api/vendors', body: newVendor(), failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC09 - GET /api/vendors/:id returns vendor', () => {
    cy.authRequest({ method: 'GET', url: `/api/vendors/${Cypress.env('vendorId')}` })
      .then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body.data._id).to.eq(Cypress.env('vendorId'));
      });
  });

  it('TC10 - GET /api/vendors/:id has required fields', () => {
    cy.authRequest({ method: 'GET', url: `/api/vendors/${Cypress.env('vendorId')}` })
      .then(({ body }) => {
        expect(body.data).to.have.property('name');
        expect(body.data).to.have.property('isActive');
        expect(body.data).to.have.property('createdAt');
      });
  });

  it('TC11 - GET /api/vendors/:id with invalid id returns error', () => {
    cy.authRequest({ method: 'GET', url: '/api/vendors/badid' })
      .then(({ status }) => expect(status).to.be.oneOf([400, 404, 500]));
  });

  it('TC12 - PUT /api/vendors/:id updates name', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/vendors/${Cypress.env('vendorId')}`,
      body: { name: 'Vendor Updated' },
    }).then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.data.name).to.eq('Vendor Updated');
    });
  });

  it('TC13 - PUT /api/vendors/:id updates contact', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/vendors/${Cypress.env('vendorId')}`,
      body: { contact: '1111111111' },
    }).then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.data.contact).to.eq('1111111111');
    });
  });

  it('TC14 - PUT /api/vendors/:id blocked without token', () => {
    cy.request({
      method: 'PUT', url: `/api/vendors/${Cypress.env('vendorId')}`,
      body: { name: 'Hacker' }, failOnStatusCode: false,
    }).then(({ status }) => expect(status).to.eq(401));
  });

  it('TC15 - GET /api/vendors response has success true', () => {
    cy.authRequest({ method: 'GET', url: '/api/vendors' })
      .then(({ body }) => expect(body.success).to.be.true);
  });

  it('TC16 - GET /api/vendors/:id with non-existent id', () => {
    cy.authRequest({ method: 'GET', url: '/api/vendors/64f1a2b3c4d5e6f7a8b9c0d1' })
      .then(({ status }) => expect(status).to.be.oneOf([200, 404]));
  });
});
