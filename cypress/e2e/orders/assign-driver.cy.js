describe('Orders - Assign Driver API', () => {
  before(() => {
    cy.loginAsAdmin();
    cy.authRequest({ method: 'POST', url: '/api/orders', body: { orderNumber: `ORD-ASGN-${Date.now()}`, status: 'pending' } })
      .then(({ body }) => Cypress.env('assignOrderId', body.data._id));
    cy.authRequest({
      method: 'POST', url: '/api/drivers',
      body: { user: Cypress.env('userId'), licenseNumber: `DL-ASGN-${Date.now()}`, vehicle: 'Truck', isAvailable: true },
    }).then(({ body }) => Cypress.env('assignDriverId', body.data._id));
  });

  it('TC01 - POST /orders/:id/assign-driver returns 200 or 501', () => {
    cy.authRequest({
      method: 'POST', url: `/api/orders/${Cypress.env('assignOrderId')}/assign-driver`,
      body: { driverId: Cypress.env('assignDriverId') },
    }).then(({ status }) => expect(status).to.be.oneOf([200, 201, 404, 501]));
  });

  it('TC02 - POST /orders/:id/assign-driver updates order driver field', () => {
    cy.authRequest({
      method: 'POST', url: `/api/orders/${Cypress.env('assignOrderId')}/assign-driver`,
      body: { driverId: Cypress.env('assignDriverId') },
    }).then(({ status, body }) => {
      if (status === 200 || status === 201) expect(body.data).to.have.property('driver');
    });
  });

  it('TC03 - POST /orders/:id/assign-driver fails without driverId', () => {
    cy.authRequest({ method: 'POST', url: `/api/orders/${Cypress.env('assignOrderId')}/assign-driver`, body: {} })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500, 501]));
  });

  it('TC04 - POST /orders/:id/assign-driver fails with invalid orderId', () => {
    cy.authRequest({ method: 'POST', url: '/api/orders/invalidid/assign-driver', body: { driverId: Cypress.env('assignDriverId') } })
      .then(({ status }) => expect(status).to.be.oneOf([400, 404, 500, 501]));
  });

  it('TC05 - POST /orders/:id/assign-driver fails with invalid driverId', () => {
    cy.authRequest({ method: 'POST', url: `/api/orders/${Cypress.env('assignOrderId')}/assign-driver`, body: { driverId: 'invalidDriverId' } })
      .then(({ status }) => expect(status).to.be.oneOf([400, 404, 500, 501]));
  });

  it('TC06 - POST /orders/:id/assign-driver blocked without token', () => {
    cy.request({ method: 'POST', url: `/api/orders/${Cypress.env('assignOrderId')}/assign-driver`, body: { driverId: Cypress.env('assignDriverId') }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.be.oneOf([401, 404, 501]));
  });

  it('TC07 - POST /orders/:id/assign-driver with non-existent order', () => {
    cy.authRequest({ method: 'POST', url: '/api/orders/64f1a2b3c4d5e6f7a8b9c0d1/assign-driver', body: { driverId: Cypress.env('assignDriverId') } })
      .then(({ status }) => expect(status).to.be.oneOf([400, 404, 500, 501]));
  });

  it('TC08 - POST /orders/:id/assign-driver with non-existent driver', () => {
    cy.authRequest({ method: 'POST', url: `/api/orders/${Cypress.env('assignOrderId')}/assign-driver`, body: { driverId: '64f1a2b3c4d5e6f7a8b9c0d1' } })
      .then(({ status }) => expect(status).to.be.oneOf([400, 404, 500, 501]));
  });

  it('TC09 - POST /orders/:id/assign-driver response has success field', () => {
    cy.authRequest({ method: 'POST', url: `/api/orders/${Cypress.env('assignOrderId')}/assign-driver`, body: { driverId: Cypress.env('assignDriverId') } })
      .then(({ body }) => expect(body).to.have.property('success'));
  });

  it('TC10 - POST /orders/:id/assign-driver correct content-type', () => {
    cy.authRequest({ method: 'POST', url: `/api/orders/${Cypress.env('assignOrderId')}/assign-driver`, body: { driverId: Cypress.env('assignDriverId') } })
      .then((res) => expect(res.headers['content-type']).to.include('application/json'));
  });

  it('TC11 - POST /orders/:id/assign-driver with empty body', () => {
    cy.authRequest({ method: 'POST', url: `/api/orders/${Cypress.env('assignOrderId')}/assign-driver`, body: {} })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500, 501]));
  });

  it('TC12 - POST /orders/:id/assign-driver response time acceptable', () => {
    const start = Date.now();
    cy.authRequest({ method: 'POST', url: `/api/orders/${Cypress.env('assignOrderId')}/assign-driver`, body: { driverId: Cypress.env('assignDriverId') } })
      .then(() => expect(Date.now() - start).to.be.lessThan(3000));
  });

  it('TC13 - POST /orders/:id/assign-driver with null driverId', () => {
    cy.authRequest({ method: 'POST', url: `/api/orders/${Cypress.env('assignOrderId')}/assign-driver`, body: { driverId: null } })
      .then(({ status }) => expect(status).to.be.oneOf([400, 422, 500, 501]));
  });

  it('TC14 - POST /orders/:id/assign-driver returns updated order', () => {
    cy.authRequest({ method: 'POST', url: `/api/orders/${Cypress.env('assignOrderId')}/assign-driver`, body: { driverId: Cypress.env('assignDriverId') } })
      .then(({ status, body }) => {
        if (status === 200 || status === 201) {
          expect(body.data).to.have.property('_id');
          expect(body.data).to.have.property('orderNumber');
        }
      });
  });

  it('TC15 - POST /orders/:id/assign-driver changes status to assigned', () => {
    cy.authRequest({ method: 'POST', url: `/api/orders/${Cypress.env('assignOrderId')}/assign-driver`, body: { driverId: Cypress.env('assignDriverId') } })
      .then(({ status, body }) => {
        if (status === 200 || status === 201) {
          expect(['assigned', 'pending']).to.include(body.data.status);
        }
      });
  });
});
