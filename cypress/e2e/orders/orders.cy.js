describe('Orders API', () => {
  before(() => cy.loginAsAdmin());

  const newOrder = () => ({
    orderNumber: `ORD-CY-${Date.now()}`,
    status: 'pending',
    scheduledAt: '2025-08-01T10:00:00Z',
  });

  it('TC01 - GET /api/orders returns 200', () => {
    cy.authRequest({ method: 'GET', url: '/api/orders' })
      .then(({ status }) => expect(status).to.eq(200));
  });

  it('TC02 - GET /api/orders returns array', () => {
    cy.authRequest({ method: 'GET', url: '/api/orders' })
      .then(({ body }) => expect(body.data).to.be.an('array'));
  });

  it('TC03 - GET /api/orders has seed orders', () => {
    cy.authRequest({ method: 'GET', url: '/api/orders' })
      .then(({ body }) => expect(body.data.length).to.be.greaterThan(0));
  });

  it('TC04 - GET /api/orders blocked without token', () => {
    cy.request({ method: 'GET', url: '/api/orders', failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC05 - POST /api/orders creates order and returns 201', () => {
    cy.authRequest({ method: 'POST', url: '/api/orders', body: newOrder() })
      .then(({ status, body }) => {
        expect(status).to.eq(201);
        expect(body.data).to.have.property('_id');
        Cypress.env('orderId', body.data._id);
      });
  });

  it('TC06 - POST /api/orders returns correct orderNumber', () => {
    const order = newOrder();
    cy.authRequest({ method: 'POST', url: '/api/orders', body: order })
      .then(({ body }) => expect(body.data.orderNumber).to.eq(order.orderNumber));
  });

  it('TC07 - POST /api/orders default status is pending', () => {
    cy.authRequest({ method: 'POST', url: '/api/orders', body: { orderNumber: `ORD-DEF-${Date.now()}` } })
      .then(({ body }) => expect(body.data.status).to.eq('pending'));
  });

  it('TC08 - POST /api/orders fails with duplicate orderNumber', () => {
    const order = newOrder();
    cy.authRequest({ method: 'POST', url: '/api/orders', body: order });
    cy.authRequest({ method: 'POST', url: '/api/orders', body: order })
      .then(({ status }) => expect(status).to.be.oneOf([400, 409, 500]));
  });

  it('TC09 - POST /api/orders fails without orderNumber', () => {
    cy.authRequest({ method: 'POST', url: '/api/orders', body: { status: 'pending' } })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500]));
  });

  it('TC10 - POST /api/orders blocked without token', () => {
    cy.request({ method: 'POST', url: '/api/orders', body: newOrder(), failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC11 - GET /api/orders/:id returns order', () => {
    cy.authRequest({ method: 'GET', url: `/api/orders/${Cypress.env('orderId')}` })
      .then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body.data._id).to.eq(Cypress.env('orderId'));
      });
  });

  it('TC12 - GET /api/orders/:id has required fields', () => {
    cy.authRequest({ method: 'GET', url: `/api/orders/${Cypress.env('orderId')}` })
      .then(({ body }) => {
        expect(body.data).to.have.property('orderNumber');
        expect(body.data).to.have.property('status');
        expect(body.data).to.have.property('createdAt');
      });
  });

  it('TC13 - GET /api/orders/:id with invalid id returns error', () => {
    cy.authRequest({ method: 'GET', url: '/api/orders/badid' })
      .then(({ status }) => expect(status).to.be.oneOf([400, 404, 500]));
  });

  it('TC14 - PUT /api/orders/:id updates status to in_transit', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/orders/${Cypress.env('orderId')}`,
      body: { status: 'in_transit' },
    }).then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.data.status).to.eq('in_transit');
    });
  });

  it('TC15 - PUT /api/orders/:id blocked without token', () => {
    cy.request({
      method: 'PUT', url: `/api/orders/${Cypress.env('orderId')}`,
      body: { status: 'cancelled' }, failOnStatusCode: false,
    }).then(({ status }) => expect(status).to.eq(401));
  });

  it('TC16 - GET /api/orders response has success true', () => {
    cy.authRequest({ method: 'GET', url: '/api/orders' })
      .then(({ body }) => expect(body.success).to.be.true);
  });

  it('TC17 - GET /api/orders/:id blocked without token', () => {
    cy.request({ method: 'GET', url: `/api/orders/${Cypress.env('orderId')}`, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });
});
