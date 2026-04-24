describe('Analytics API', () => {
  before(() => cy.loginAsAdmin());

  it('TC01 - GET /api/analytics/summary returns 200', () => {
    cy.authRequest({ method: 'GET', url: '/api/analytics/summary' })
      .then(({ status }) => expect(status).to.eq(200));
  });

  it('TC02 - GET /api/analytics/summary has totalOrders', () => {
    cy.authRequest({ method: 'GET', url: '/api/analytics/summary' })
      .then(({ body }) => expect(body.data).to.have.property('totalOrders'));
  });

  it('TC03 - GET /api/analytics/summary has delivered', () => {
    cy.authRequest({ method: 'GET', url: '/api/analytics/summary' })
      .then(({ body }) => expect(body.data).to.have.property('delivered'));
  });

  it('TC04 - GET /api/analytics/summary has pending', () => {
    cy.authRequest({ method: 'GET', url: '/api/analytics/summary' })
      .then(({ body }) => expect(body.data).to.have.property('pending'));
  });

  it('TC05 - GET /api/analytics/summary has availableDrivers', () => {
    cy.authRequest({ method: 'GET', url: '/api/analytics/summary' })
      .then(({ body }) => expect(body.data).to.have.property('availableDrivers'));
  });

  it('TC06 - GET /api/analytics/summary all values are numbers', () => {
    cy.authRequest({ method: 'GET', url: '/api/analytics/summary' })
      .then(({ body }) => {
        expect(body.data.totalOrders).to.be.a('number');
        expect(body.data.delivered).to.be.a('number');
        expect(body.data.pending).to.be.a('number');
        expect(body.data.availableDrivers).to.be.a('number');
      });
  });

  it('TC07 - GET /api/analytics/summary totalOrders >= delivered', () => {
    cy.authRequest({ method: 'GET', url: '/api/analytics/summary' })
      .then(({ body }) => expect(body.data.totalOrders).to.be.gte(body.data.delivered));
  });

  it('TC08 - GET /api/analytics/summary blocked without token', () => {
    cy.request({ method: 'GET', url: '/api/analytics/summary', failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC09 - GET /api/analytics/orders returns 200', () => {
    cy.authRequest({ method: 'GET', url: '/api/analytics/orders' })
      .then(({ status }) => expect(status).to.eq(200));
  });

  it('TC10 - GET /api/analytics/orders has total field', () => {
    cy.authRequest({ method: 'GET', url: '/api/analytics/orders' })
      .then(({ body }) => expect(body.data).to.have.property('total'));
  });

  it('TC11 - GET /api/analytics/orders has byStatus array', () => {
    cy.authRequest({ method: 'GET', url: '/api/analytics/orders' })
      .then(({ body }) => expect(body.data.byStatus).to.be.an('array'));
  });

  it('TC12 - GET /api/analytics/orders blocked without token', () => {
    cy.request({ method: 'GET', url: '/api/analytics/orders', failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC13 - GET /api/analytics/sla returns 200', () => {
    cy.authRequest({ method: 'GET', url: '/api/analytics/sla' })
      .then(({ status }) => expect(status).to.eq(200));
  });

  it('TC14 - GET /api/analytics/sla has slaRate field', () => {
    cy.authRequest({ method: 'GET', url: '/api/analytics/sla' })
      .then(({ body }) => expect(body.data).to.have.property('slaRate'));
  });

  it('TC15 - GET /api/analytics/sla blocked without token', () => {
    cy.request({ method: 'GET', url: '/api/analytics/sla', failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(401));
  });

  it('TC16 - GET /api/analytics/orders-by-status returns array', () => {
    cy.authRequest({ method: 'GET', url: '/api/analytics/orders-by-status' })
      .then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body.data).to.be.an('array');
      });
  });
});
