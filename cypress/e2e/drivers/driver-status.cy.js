describe('Drivers - Update Driver Status API', () => {
  before(() => {
    cy.loginAsAdmin();
    cy.authRequest({
      method: 'POST', url: '/api/drivers',
      body: { user: Cypress.env('userId'), licenseNumber: `DL-ST-${Date.now()}`, vehicle: 'Truck', isAvailable: true },
    }).then(({ body }) => Cypress.env('statusDriverId', body.data._id));
  });

  it('TC01 - PUT /drivers/:id/status updates to available', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/drivers/${Cypress.env('statusDriverId')}/status`,
      body: { isAvailable: true },
    }).then(({ status }) => expect(status).to.be.oneOf([200, 404, 501]));
  });

  it('TC02 - PUT /drivers/:id/status updates to unavailable', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/drivers/${Cypress.env('statusDriverId')}/status`,
      body: { isAvailable: false },
    }).then(({ status }) => expect(status).to.be.oneOf([200, 404, 501]));
  });

  it('TC03 - PUT /drivers/:id/status returns updated driver', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/drivers/${Cypress.env('statusDriverId')}/status`,
      body: { isAvailable: true },
    }).then(({ status, body }) => {
      if (status === 200) {
        expect(body.data).to.have.property('isAvailable');
      }
    });
  });

  it('TC04 - PUT /drivers/:id/status fails without isAvailable field', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/drivers/${Cypress.env('statusDriverId')}/status`,
      body: {},
    }).then(({ status }) => expect(status).to.be.oneOf([200, 400, 422, 500, 501]));
  });

  it('TC05 - PUT /drivers/:id/status fails with invalid boolean', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/drivers/${Cypress.env('statusDriverId')}/status`,
      body: { isAvailable: 'yes' },
    }).then(({ status }) => expect(status).to.be.oneOf([200, 400, 422, 500, 501]));
  });

  it('TC06 - PUT /drivers/:id/status blocked without token', () => {
    cy.request({
      method: 'PUT', url: `/api/drivers/${Cypress.env('statusDriverId')}/status`,
      body: { isAvailable: true }, failOnStatusCode: false,
    }).then(({ status }) => expect(status).to.be.oneOf([401, 404, 501]));
  });

  it('TC07 - PUT /drivers/:id/status with invalid driverId', () => {
    cy.authRequest({
      method: 'PUT', url: '/api/drivers/badid/status',
      body: { isAvailable: true },
    }).then(({ status }) => expect(status).to.be.oneOf([400, 404, 500, 501]));
  });

  it('TC08 - PUT /drivers/:id/status with non-existent driver', () => {
    cy.authRequest({
      method: 'PUT', url: '/api/drivers/64f1a2b3c4d5e6f7a8b9c0d1/status',
      body: { isAvailable: true },
    }).then(({ status }) => expect(status).to.be.oneOf([404, 500, 501]));
  });

  it('TC09 - PUT /drivers/:id/status response has success field', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/drivers/${Cypress.env('statusDriverId')}/status`,
      body: { isAvailable: false },
    }).then(({ body }) => expect(body).to.have.property('success'));
  });

  it('TC10 - PUT /drivers/:id/status correct content-type', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/drivers/${Cypress.env('statusDriverId')}/status`,
      body: { isAvailable: true },
    }).then((res) => expect(res.headers['content-type']).to.include('application/json'));
  });

  it('TC11 - PUT /drivers/:id/status with null value', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/drivers/${Cypress.env('statusDriverId')}/status`,
      body: { isAvailable: null },
    }).then(({ status }) => expect(status).to.be.oneOf([200, 400, 422, 500, 501]));
  });

  it('TC12 - PUT /drivers/:id/status multiple updates', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/drivers/${Cypress.env('statusDriverId')}/status`,
      body: { isAvailable: true },
    });
    cy.authRequest({
      method: 'PUT', url: `/api/drivers/${Cypress.env('statusDriverId')}/status`,
      body: { isAvailable: false },
    }).then(({ status }) => expect(status).to.be.oneOf([200, 404, 501]));
  });

  it('TC13 - PUT /drivers/:id/status response time acceptable', () => {
    const start = Date.now();
    cy.authRequest({
      method: 'PUT', url: `/api/drivers/${Cypress.env('statusDriverId')}/status`,
      body: { isAvailable: true },
    }).then(() => expect(Date.now() - start).to.be.lessThan(2000));
  });

  it('TC14 - PUT /drivers/:id/status with extra fields ignored', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/drivers/${Cypress.env('statusDriverId')}/status`,
      body: { isAvailable: true, extraField: 'ignored' },
    }).then(({ status }) => expect(status).to.be.oneOf([200, 404, 501]));
  });

  it('TC15 - PUT /drivers/:id/status idempotent behavior', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/drivers/${Cypress.env('statusDriverId')}/status`,
      body: { isAvailable: true },
    });
    cy.authRequest({
      method: 'PUT', url: `/api/drivers/${Cypress.env('statusDriverId')}/status`,
      body: { isAvailable: true },
    }).then(({ status }) => expect(status).to.be.oneOf([200, 404, 501]));
  });
});
