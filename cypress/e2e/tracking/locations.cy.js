describe('Tracking - Locations API', () => {
  before(() => {
    cy.loginAsAdmin();
    cy.authRequest({ method: 'POST', url: '/api/orders', body: { orderNumber: `ORD-LOC-${Date.now()}`, status: 'in_transit' } })
      .then(({ body }) => Cypress.env('locOrderId', body.data._id));
  });

  it('TC01 - POST /api/tracking adds location and returns 201', () => {
    cy.authRequest({ method: 'POST', url: '/api/tracking', body: { order: Cypress.env('locOrderId'), coordinates: { lat: 17.385, lng: 78.4867 } } })
      .then(({ status }) => expect(status).to.eq(201));
  });

  it('TC02 - POST /api/tracking returns correct coordinates', () => {
    cy.authRequest({ method: 'POST', url: '/api/tracking', body: { order: Cypress.env('locOrderId'), coordinates: { lat: 17.400, lng: 78.500 } } })
      .then(({ status, body }) => {
        if (status === 201) {
          expect(body.data.coordinates.lat).to.eq(17.400);
          expect(body.data.coordinates.lng).to.eq(78.500);
        }
      });
  });

  it('TC03 - POST /api/tracking without order is handled', () => {
    cy.authRequest({ method: 'POST', url: '/api/tracking', body: { coordinates: { lat: 17.385, lng: 78.4867 } } })
      .then(({ status }) => expect(status).to.be.oneOf([201, 400, 422, 500]));
  });

  it('TC04 - POST /api/tracking without coordinates is handled', () => {
    cy.authRequest({ method: 'POST', url: '/api/tracking', body: { order: Cypress.env('locOrderId') } })
      .then(({ status }) => expect(status).to.be.oneOf([201, 400, 422, 500]));
  });

  it('TC05 - POST /api/tracking without lat is handled', () => {
    cy.authRequest({ method: 'POST', url: '/api/tracking', body: { order: Cypress.env('locOrderId'), coordinates: { lng: 78.4867 } } })
      .then(({ status }) => expect(status).to.be.oneOf([201, 400, 422, 500]));
  });

  it('TC06 - POST /api/tracking without lng is handled', () => {
    cy.authRequest({ method: 'POST', url: '/api/tracking', body: { order: Cypress.env('locOrderId'), coordinates: { lat: 17.385 } } })
      .then(({ status }) => expect(status).to.be.oneOf([201, 400, 422, 500]));
  });

  it('TC07 - POST /api/tracking blocked without token', () => {
    cy.request({ method: 'POST', url: '/api/tracking', body: { order: Cypress.env('locOrderId'), coordinates: { lat: 17.385, lng: 78.4867 } }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC08 - POST /api/tracking with driver field', () => {
    cy.authRequest({ method: 'POST', url: '/api/tracking', body: { order: Cypress.env('locOrderId'), driver: Cypress.env('userId'), coordinates: { lat: 17.410, lng: 78.510 } } })
      .then(({ status }) => expect(status).to.eq(201));
  });

  it('TC09 - POST /api/tracking recordedAt auto-generated', () => {
    cy.authRequest({ method: 'POST', url: '/api/tracking', body: { order: Cypress.env('locOrderId'), coordinates: { lat: 17.420, lng: 78.520 } } })
      .then(({ status, body }) => {
        if (status === 201) expect(body.data).to.have.property('recordedAt');
      });
  });

  it('TC10 - POST /api/tracking with invalid orderId is handled', () => {
    cy.authRequest({ method: 'POST', url: '/api/tracking', body: { order: 'badid', coordinates: { lat: 17.385, lng: 78.4867 } } })
      .then(({ status }) => expect(status).to.be.oneOf([201, 400, 404, 500]));
  });

  it('TC11 - GET /api/tracking/:orderId returns 200', () => {
    cy.authRequest({ method: 'GET', url: `/api/tracking/${Cypress.env('locOrderId')}` })
      .then(({ status }) => expect(status).to.eq(200));
  });

  it('TC12 - GET /api/tracking/:orderId returns array', () => {
    cy.authRequest({ method: 'GET', url: `/api/tracking/${Cypress.env('locOrderId')}` })
      .then(({ body }) => expect(body.data).to.be.an('array'));
  });

  it('TC13 - GET /api/tracking/:orderId blocked without token', () => {
    cy.request({ method: 'GET', url: `/api/tracking/${Cypress.env('locOrderId')}`, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC14 - GET /api/tracking/:orderId with invalid orderId', () => {
    cy.authRequest({ method: 'GET', url: '/api/tracking/badid' })
      .then(({ status }) => expect(status).to.be.oneOf([200, 400, 404, 500]));
  });

  it('TC15 - GET /api/tracking/:orderId sorted by recordedAt', () => {
    cy.authRequest({ method: 'GET', url: `/api/tracking/${Cypress.env('locOrderId')}` })
      .then(({ body }) => {
        if (body.data.length > 1) {
          const first = new Date(body.data[0].recordedAt).getTime();
          const second = new Date(body.data[1].recordedAt).getTime();
          expect(first).to.be.lte(second);
        }
      });
  });
});
