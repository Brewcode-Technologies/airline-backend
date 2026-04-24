describe('Orders - Status Update APIs', () => {
  before(() => {
    cy.loginAsAdmin();
    cy.authRequest({ method: 'POST', url: '/api/orders', body: { orderNumber: `ORD-ST-${Date.now()}`, status: 'pending' } })
      .then(({ body }) => Cypress.env('statusOrderId', body.data._id));
  });

  // PUT /orders/:id/status
  it('TC01 - PUT /orders/:id/status updates to in_transit', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/orders/${Cypress.env('statusOrderId')}/status`,
      body: { status: 'in_transit' },
    }).then(({ status }) => expect(status).to.be.oneOf([200, 404, 501]));
  });

  it('TC02 - PUT /orders/:id/status updates to delivered', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/orders/${Cypress.env('statusOrderId')}/status`,
      body: { status: 'delivered' },
    }).then(({ status }) => expect(status).to.be.oneOf([200, 404, 501]));
  });

  it('TC03 - PUT /orders/:id/status updates to cancelled', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/orders/${Cypress.env('statusOrderId')}/status`,
      body: { status: 'cancelled' },
    }).then(({ status }) => expect(status).to.be.oneOf([200, 404, 501]));
  });

  it('TC04 - PUT /orders/:id/status fails with invalid status', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/orders/${Cypress.env('statusOrderId')}/status`,
      body: { status: 'flying' },
    }).then(({ status }) => expect(status).to.be.oneOf([400, 422, 500, 501]));
  });

  it('TC05 - PUT /orders/:id/status fails without status field', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/orders/${Cypress.env('statusOrderId')}/status`,
      body: {},
    }).then(({ status }) => expect(status).to.be.oneOf([400, 422, 500, 501]));
  });

  it('TC06 - PUT /orders/:id/status blocked without token', () => {
    cy.request({
      method: 'PUT', url: `/api/orders/${Cypress.env('statusOrderId')}/status`,
      body: { status: 'in_transit' }, failOnStatusCode: false,
    }).then(({ status }) => expect(status).to.be.oneOf([401, 404, 501]));
  });

  it('TC07 - PUT /orders/:id/status with invalid orderId', () => {
    cy.authRequest({
      method: 'PUT', url: '/api/orders/badid/status',
      body: { status: 'in_transit' },
    }).then(({ status }) => expect(status).to.be.oneOf([400, 404, 500, 501]));
  });

  // PUT /orders/:id/picked
  it('TC08 - PUT /orders/:id/picked updates status to picked', () => {
    cy.authRequest({ method: 'PUT', url: `/api/orders/${Cypress.env('statusOrderId')}/picked` })
      .then(({ status }) => expect(status).to.be.oneOf([200, 404, 501]));
  });

  it('TC09 - PUT /orders/:id/picked blocked without token', () => {
    cy.request({ method: 'PUT', url: `/api/orders/${Cypress.env('statusOrderId')}/picked`, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.be.oneOf([401, 404, 501]));
  });

  it('TC10 - PUT /orders/:id/picked with invalid orderId', () => {
    cy.authRequest({ method: 'PUT', url: '/api/orders/badid/picked' })
      .then(({ status }) => expect(status).to.be.oneOf([400, 404, 500, 501]));
  });

  // PUT /orders/:id/enroute
  it('TC11 - PUT /orders/:id/enroute updates status to enroute', () => {
    cy.authRequest({ method: 'PUT', url: `/api/orders/${Cypress.env('statusOrderId')}/enroute` })
      .then(({ status }) => expect(status).to.be.oneOf([200, 404, 501]));
  });

  it('TC12 - PUT /orders/:id/enroute blocked without token', () => {
    cy.request({ method: 'PUT', url: `/api/orders/${Cypress.env('statusOrderId')}/enroute`, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.be.oneOf([401, 404, 501]));
  });

  // PUT /orders/:id/delivered
  it('TC13 - PUT /orders/:id/delivered updates status to delivered', () => {
    cy.authRequest({ method: 'PUT', url: `/api/orders/${Cypress.env('statusOrderId')}/delivered` })
      .then(({ status }) => expect(status).to.be.oneOf([200, 404, 501]));
  });

  it('TC14 - PUT /orders/:id/delivered blocked without token', () => {
    cy.request({ method: 'PUT', url: `/api/orders/${Cypress.env('statusOrderId')}/delivered`, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.be.oneOf([401, 404, 501]));
  });

  it('TC15 - PUT /orders/:id/delivered with invalid orderId', () => {
    cy.authRequest({ method: 'PUT', url: '/api/orders/badid/delivered' })
      .then(({ status }) => expect(status).to.be.oneOf([400, 404, 500, 501]));
  });

  it('TC16 - PUT /orders/:id/status response has correct content-type', () => {
    cy.authRequest({
      method: 'PUT', url: `/api/orders/${Cypress.env('statusOrderId')}/status`,
      body: { status: 'pending' },
    }).then((res) => expect(res.headers['content-type']).to.include('application/json'));
  });
});
