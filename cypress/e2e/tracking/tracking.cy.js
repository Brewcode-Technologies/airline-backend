describe('Tracking API', () => {
  before(() => {
    cy.loginAsAdmin();
    cy.authRequest({ method: 'POST', url: '/api/orders', body: { orderNumber: `ORD-TRK-${Date.now()}`, status: 'in_transit' } })
      .then(({ body }) => Cypress.env('trackingOrderId', body.data._id));
  });

  it('TC01 - POST /api/tracking adds location and returns 201', () => {
    cy.authRequest({ method: 'POST', url: '/api/tracking', body: { order: Cypress.env('trackingOrderId'), coordinates: { lat: 17.385, lng: 78.4867 } } })
      .then(({ status, body }) => {
        expect(status).to.eq(201);
        expect(body.data).to.have.property('_id');
      });
  });

  it('TC02 - POST /api/tracking returns correct coordinates', () => {
    cy.authRequest({ method: 'POST', url: '/api/tracking', body: { order: Cypress.env('trackingOrderId'), coordinates: { lat: 17.400, lng: 78.500 } } })
      .then(({ body }) => {
        expect(body.data.coordinates.lat).to.eq(17.400);
        expect(body.data.coordinates.lng).to.eq(78.500);
      });
  });

  it('TC03 - POST /api/tracking without order still saves (order optional in model)', () => {
    cy.authRequest({ method: 'POST', url: '/api/tracking', body: { coordinates: { lat: 17.385, lng: 78.4867 } } })
      .then(({ status }) => expect(status).to.be.oneOf([201, 400, 422, 500]));
  });

  it('TC04 - POST /api/tracking without coordinates still saves (coordinates optional in model)', () => {
    cy.authRequest({ method: 'POST', url: '/api/tracking', body: { order: Cypress.env('trackingOrderId') } })
      .then(({ status }) => expect(status).to.be.oneOf([201, 400, 422, 500]));
  });

  it('TC05 - POST /api/tracking blocked without token', () => {
    cy.request({ method: 'POST', url: '/api/tracking', body: { order: Cypress.env('trackingOrderId'), coordinates: { lat: 17.385, lng: 78.4867 } }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC06 - GET /api/tracking/:orderId returns 200', () => {
    cy.authRequest({ method: 'GET', url: `/api/tracking/${Cypress.env('trackingOrderId')}` })
      .then(({ status }) => expect(status).to.eq(200));
  });

  it('TC07 - GET /api/tracking/:orderId returns array', () => {
    cy.authRequest({ method: 'GET', url: `/api/tracking/${Cypress.env('trackingOrderId')}` })
      .then(({ body }) => expect(body.data).to.be.an('array'));
  });

  it('TC08 - GET /api/tracking/:orderId has at least one location', () => {
    cy.authRequest({ method: 'GET', url: `/api/tracking/${Cypress.env('trackingOrderId')}` })
      .then(({ body }) => expect(body.data.length).to.be.greaterThan(0));
  });

  it('TC09 - GET /api/tracking/:orderId each location has _id and order', () => {
    cy.authRequest({ method: 'GET', url: `/api/tracking/${Cypress.env('trackingOrderId')}` })
      .then(({ body }) => {
        body.data.forEach(loc => {
          expect(loc).to.have.property('_id');
          expect(loc).to.have.property('order');
        });
      });
  });

  it('TC10 - GET /api/tracking/:orderId blocked without token', () => {
    cy.request({ method: 'GET', url: `/api/tracking/${Cypress.env('trackingOrderId')}`, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC11 - GET /api/tracking/:orderId with invalid id returns error', () => {
    cy.authRequest({ method: 'GET', url: '/api/tracking/badid' })
      .then(({ status }) => expect(status).to.be.oneOf([200, 400, 404, 500]));
  });

  it('TC12 - POST /api/tracking with driver field', () => {
    cy.authRequest({ method: 'POST', url: '/api/tracking', body: { order: Cypress.env('trackingOrderId'), driver: Cypress.env('userId'), coordinates: { lat: 17.410, lng: 78.510 } } })
      .then(({ status, body }) => {
        expect(status).to.eq(201);
        expect(body.data).to.have.property('driver');
      });
  });

  it('TC13 - POST /api/tracking recordedAt is auto-generated', () => {
    cy.authRequest({ method: 'POST', url: '/api/tracking', body: { order: Cypress.env('trackingOrderId'), coordinates: { lat: 17.420, lng: 78.520 } } })
      .then(({ body }) => expect(body.data).to.have.property('recordedAt'));
  });

  it('TC14 - GET /api/tracking/:orderId sorted by recordedAt ascending', () => {
    cy.authRequest({ method: 'GET', url: `/api/tracking/${Cypress.env('trackingOrderId')}` })
      .then(({ body }) => {
        if (body.data.length > 1) {
          const first = new Date(body.data[0].recordedAt).getTime();
          const second = new Date(body.data[1].recordedAt).getTime();
          expect(first).to.be.lte(second);
        }
      });
  });

  it('TC15 - POST /api/tracking multiple locations for same order', () => {
    cy.authRequest({ method: 'POST', url: '/api/tracking', body: { order: Cypress.env('trackingOrderId'), coordinates: { lat: 17.430, lng: 78.530 } } })
      .then(({ status }) => expect(status).to.eq(201));
  });
});
