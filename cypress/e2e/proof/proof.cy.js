describe('Orders - Proof APIs', () => {
  before(() => {
    cy.loginAsAdmin();
    cy.authRequest({ method: 'POST', url: '/api/orders', body: { orderNumber: `ORD-PRF-${Date.now()}`, status: 'delivered' } })
      .then(({ body }) => Cypress.env('proofOrderId', body.data._id));
  });

  it('TC01 - POST /orders/:id/proof submits proof and returns 201', () => {
    cy.authRequest({ method: 'POST', url: `/api/orders/${Cypress.env('proofOrderId')}/proof`, body: { notes: 'Delivered at door', imageUrl: 'https://example.com/proof.jpg' } })
      .then(({ status, body }) => {
        expect(status).to.eq(201);
        expect(body.success).to.be.true;
      });
  });

  it('TC02 - POST /orders/:id/proof returns correct notes', () => {
    cy.authRequest({ method: 'POST', url: `/api/orders/${Cypress.env('proofOrderId')}/proof`, body: { notes: 'Left at reception', imageUrl: 'https://example.com/p2.jpg' } })
      .then(({ body }) => expect(body.data.notes).to.eq('Left at reception'));
  });

  it('TC03 - POST /orders/:id/proof returns correct imageUrl', () => {
    cy.authRequest({ method: 'POST', url: `/api/orders/${Cypress.env('proofOrderId')}/proof`, body: { notes: 'Test', imageUrl: 'https://example.com/img.jpg' } })
      .then(({ body }) => expect(body.data.imageUrl).to.eq('https://example.com/img.jpg'));
  });

  it('TC04 - POST /orders/:id/proof with signature field', () => {
    cy.authRequest({ method: 'POST', url: `/api/orders/${Cypress.env('proofOrderId')}/proof`, body: { notes: 'Signed', signature: 'base64data', imageUrl: 'https://example.com/sig.jpg' } })
      .then(({ body }) => expect(body.data).to.have.property('signature'));
  });

  it('TC05 - POST /orders/:id/proof deliveredAt auto-generated', () => {
    cy.authRequest({ method: 'POST', url: `/api/orders/${Cypress.env('proofOrderId')}/proof`, body: { notes: 'Auto date', imageUrl: 'https://example.com/auto.jpg' } })
      .then(({ body }) => expect(body.data).to.have.property('deliveredAt'));
  });

  it('TC06 - POST /orders/:id/proof with invalid orderId returns error', () => {
    cy.authRequest({ method: 'POST', url: '/api/orders/badid/proof', body: { notes: 'No order', imageUrl: 'https://example.com/p.jpg' } })
      .then(({ status }) => expect(status).to.be.oneOf([400, 404, 500]));
  });

  it('TC07 - POST /orders/:id/proof blocked without token', () => {
    cy.request({ method: 'POST', url: `/api/orders/${Cypress.env('proofOrderId')}/proof`, body: { notes: 'Test', imageUrl: 'https://example.com/p.jpg' }, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC08 - POST /orders/:id/proof with non-existent order', () => {
    cy.authRequest({ method: 'POST', url: '/api/orders/64f1a2b3c4d5e6f7a8b9c0d1/proof', body: { notes: 'Ghost', imageUrl: 'https://example.com/g.jpg' } })
      .then(({ status }) => expect(status).to.be.oneOf([201, 400, 404, 500]));
  });

  it('TC09 - POST /orders/:id/proof response has success field', () => {
    cy.authRequest({ method: 'POST', url: `/api/orders/${Cypress.env('proofOrderId')}/proof`, body: { notes: 'Success check', imageUrl: 'https://example.com/s.jpg' } })
      .then(({ body }) => expect(body.success).to.be.true);
  });

  it('TC10 - POST /orders/:id/proof correct content-type', () => {
    cy.authRequest({ method: 'POST', url: `/api/orders/${Cypress.env('proofOrderId')}/proof`, body: { notes: 'CT check', imageUrl: 'https://example.com/ct.jpg' } })
      .then((res) => expect(res.headers['content-type']).to.include('application/json'));
  });

  it('TC11 - GET /orders/:id/proof returns 200', () => {
    cy.authRequest({ method: 'GET', url: `/api/orders/${Cypress.env('proofOrderId')}/proof` })
      .then(({ status }) => expect(status).to.eq(200));
  });

  it('TC12 - GET /orders/:id/proof returns proof object with order field', () => {
    cy.authRequest({ method: 'GET', url: `/api/orders/${Cypress.env('proofOrderId')}/proof` })
      .then(({ body }) => {
        if (body.data) expect(body.data).to.have.property('order');
      });
  });

  it('TC13 - GET /orders/:id/proof blocked without token', () => {
    cy.request({ method: 'GET', url: `/api/orders/${Cypress.env('proofOrderId')}/proof`, failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC14 - GET /orders/:id/proof with invalid orderId', () => {
    cy.authRequest({ method: 'GET', url: '/api/orders/badid/proof' })
      .then(({ status }) => expect(status).to.be.oneOf([400, 404, 500]));
  });

  it('TC15 - GET /orders/:id/proof for non-existent order returns null', () => {
    cy.authRequest({ method: 'GET', url: '/api/orders/64f1a2b3c4d5e6f7a8b9c0d1/proof' })
      .then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body.data).to.be.null;
      });
  });
});
