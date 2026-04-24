describe('Drivers API', () => {
  before(() => cy.loginAsAdmin());

  it('TC01 - GET /api/drivers returns 200', () => {
    cy.authRequest({ method: 'GET', url: '/api/drivers' })
      .then(({ status }) => expect(status).to.eq(200));
  });

  it('TC02 - GET /api/drivers returns array', () => {
    cy.authRequest({ method: 'GET', url: '/api/drivers' })
      .then(({ body }) => expect(body.data).to.be.an('array'));
  });

  it('TC03 - GET /api/drivers has seed drivers', () => {
    cy.authRequest({ method: 'GET', url: '/api/drivers' })
      .then(({ body }) => expect(body.data.length).to.be.greaterThan(0));
  });

  it('TC04 - GET /api/drivers blocked without token', () => {
    cy.request({ method: 'GET', url: '/api/drivers', failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC05 - POST /api/drivers creates driver and returns 201', () => {
    cy.authRequest({
      method: 'POST', url: '/api/drivers',
      body: { user: Cypress.env('userId'), licenseNumber: `DL-CY-${Date.now()}`, vehicle: 'Truck', isAvailable: true },
    }).then(({ status, body }) => {
      expect(status).to.eq(201);
      expect(body.data).to.have.property('_id');
      Cypress.env('driverId', body.data._id);
    });
  });

  it('TC06 - POST /api/drivers returns correct vehicle', () => {
    cy.authRequest({
      method: 'POST', url: '/api/drivers',
      body: { user: Cypress.env('userId'), licenseNumber: `DL-CY-V-${Date.now()}`, vehicle: 'Van', isAvailable: true },
    }).then(({ body }) => expect(body.data.vehicle).to.eq('Van'));
  });

  it('TC07 - POST /api/drivers isAvailable defaults to true', () => {
    cy.authRequest({
      method: 'POST', url: '/api/drivers',
      body: { user: Cypress.env('userId'), licenseNumber: `DL-CY-D-${Date.now()}`, vehicle: 'Bike' },
    }).then(({ body }) => expect(body.data.isAvailable).to.be.true);
  });

  it('TC08 - POST /api/drivers fails without user', () => {
    cy.authRequest({ method: 'POST', url: '/api/drivers', body: { licenseNumber: 'DL-NOUSER', vehicle: 'Truck' } })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500]));
  });

  it('TC09 - POST /api/drivers blocked without token', () => {
    cy.request({
      method: 'POST', url: '/api/drivers',
      body: { user: Cypress.env('userId'), licenseNumber: 'DL-NOAUTH', vehicle: 'Truck' },
      failOnStatusCode: false,
    }).then(({ status }) => expect(status).to.eq(401));
  });

  it('TC10 - GET /api/drivers/:id returns driver', () => {
    cy.authRequest({ method: 'GET', url: `/api/drivers/${Cypress.env('driverId')}` })
      .then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body.data._id).to.eq(Cypress.env('driverId'));
      });
  });

  it('TC11 - GET /api/drivers/:id has required fields', () => {
    cy.authRequest({ method: 'GET', url: `/api/drivers/${Cypress.env('driverId')}` })
      .then(({ body }) => {
        expect(body.data).to.have.property('vehicle');
        expect(body.data).to.have.property('isAvailable');
        expect(body.data).to.have.property('licenseNumber');
      });
  });

  it('TC12 - GET /api/drivers/:id with invalid id returns error', () => {
    cy.authRequest({ method: 'GET', url: '/api/drivers/badid' })
      .then(({ status }) => expect(status).to.be.oneOf([400, 404, 500]));
  });

  it('TC13 - PUT /api/drivers/:id updates vehicle', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/drivers/${Cypress.env('driverId')}`,
      body: { vehicle: 'Motorcycle' },
    }).then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.data.vehicle).to.eq('Motorcycle');
    });
  });

  it('TC14 - PUT /api/drivers/:id updates isAvailable', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/drivers/${Cypress.env('driverId')}`,
      body: { isAvailable: false },
    }).then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.data.isAvailable).to.be.false;
    });
  });

  it('TC15 - PUT /api/drivers/:id blocked without token', () => {
    cy.request({
      method: 'PUT', url: `/api/drivers/${Cypress.env('driverId')}`,
      body: { vehicle: 'Hacker' }, failOnStatusCode: false,
    }).then(({ status }) => expect(status).to.eq(401));
  });

  it('TC16 - GET /api/drivers response has success true', () => {
    cy.authRequest({ method: 'GET', url: '/api/drivers' })
      .then(({ body }) => expect(body.success).to.be.true);
  });
});
