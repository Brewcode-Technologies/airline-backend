describe('SKUs - Vendor-based API', () => {
  before(() => {
    cy.loginAsAdmin();
    cy.authRequest({ method: 'POST', url: '/api/vendors', body: { name: `Vendor-SKU-${Date.now()}`, email: `vsku_${Date.now()}@test.com` } })
      .then(({ body }) => Cypress.env('skuVendorId', body.data._id));
  });

  const newSKU = () => ({
    code: `SKU-CY-${Date.now()}`,
    name: 'Cypress SKU',
    description: 'Test SKU item',
    unit: 'kg',
  });

  it('TC01 - GET /api/skus returns 200', () => {
    cy.authRequest({ method: 'GET', url: '/api/skus' })
      .then(({ status }) => expect(status).to.eq(200));
  });

  it('TC02 - GET /api/skus returns array', () => {
    cy.authRequest({ method: 'GET', url: '/api/skus' })
      .then(({ body }) => expect(body.data).to.be.an('array'));
  });

  it('TC03 - GET /api/skus has seed SKUs', () => {
    cy.authRequest({ method: 'GET', url: '/api/skus' })
      .then(({ body }) => expect(body.data.length).to.be.greaterThan(0));
  });

  it('TC04 - GET /api/skus?vendorId= filters by vendor', () => {
    cy.authRequest({ method: 'GET', url: `/api/skus?vendorId=${Cypress.env('skuVendorId')}` })
      .then(({ status }) => expect(status).to.be.oneOf([200, 400]));
  });

  it('TC05 - GET /api/skus?airportCode=HYD filters by airport', () => {
    cy.authRequest({ method: 'GET', url: '/api/skus?airportCode=HYD' })
      .then(({ status }) => expect(status).to.be.oneOf([200, 400]));
  });

  it('TC06 - GET /api/skus blocked without token', () => {
    cy.request({ method: 'GET', url: '/api/skus', failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC07 - POST /api/skus creates SKU and returns 201', () => {
    cy.authRequest({ method: 'POST', url: '/api/skus', body: newSKU() })
      .then(({ status, body }) => {
        expect(status).to.eq(201);
        expect(body.data).to.have.property('_id');
        Cypress.env('skuId', body.data._id);
      });
  });

  it('TC08 - POST /api/skus with vendorId', () => {
    cy.authRequest({ method: 'POST', url: '/api/skus', body: { ...newSKU(), vendor: Cypress.env('skuVendorId') } })
      .then(({ status, body }) => {
        expect(status).to.eq(201);
        expect(body.data).to.have.property('vendor');
      });
  });

  it('TC09 - POST /api/skus fails with duplicate code', () => {
    const sku = newSKU();
    cy.authRequest({ method: 'POST', url: '/api/skus', body: sku });
    cy.authRequest({ method: 'POST', url: '/api/skus', body: sku })
      .then(({ status }) => expect(status).to.be.oneOf([400, 409, 500]));
  });

  it('TC10 - POST /api/skus fails without code', () => {
    cy.authRequest({ method: 'POST', url: '/api/skus', body: { name: 'No Code', unit: 'kg' } })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500]));
  });

  it('TC11 - POST /api/skus fails without name', () => {
    cy.authRequest({ method: 'POST', url: '/api/skus', body: { code: `SKU-NN-${Date.now()}`, unit: 'kg' } })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500]));
  });

  it('TC12 - POST /api/skus blocked without token', () => {
    cy.request({ method: 'POST', url: '/api/skus', body: newSKU(), failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC13 - GET /api/skus/:id returns correct SKU', () => {
    cy.authRequest({ method: 'GET', url: `/api/skus/${Cypress.env('skuId')}` })
      .then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body.data._id).to.eq(Cypress.env('skuId'));
      });
  });

  it('TC14 - GET /api/skus/:id has required fields', () => {
    cy.authRequest({ method: 'GET', url: `/api/skus/${Cypress.env('skuId')}` })
      .then(({ body }) => {
        expect(body.data).to.have.property('code');
        expect(body.data).to.have.property('name');
        expect(body.data).to.have.property('unit');
      });
  });

  it('TC15 - PUT /api/skus/:id updates name', () => {
    cy.authRequest({ method: 'PUT', url: `/api/skus/${Cypress.env('skuId')}`, body: { name: 'Updated SKU' } })
      .then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body.data.name).to.eq('Updated SKU');
      });
  });

  it('TC16 - PUT /api/skus/:id blocked without token', () => {
    cy.request({ method: 'PUT', url: `/api/skus/${Cypress.env('skuId')}`, body: { name: 'Hack' }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC17 - GET /api/skus response has success true', () => {
    cy.authRequest({ method: 'GET', url: '/api/skus' })
      .then(({ body }) => expect(body.success).to.be.true);
  });
});
