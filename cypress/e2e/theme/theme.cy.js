describe('Theme API', () => {
  before(() => cy.loginAsAdmin());

  it('TC01 - GET /api/theme returns 200', () => {
    cy.request({ method: 'GET', url: '/api/theme', failOnStatusCode: false })
      .then(({ status }) => expect(status).to.eq(200));
  });

  it('TC02 - GET /api/theme is public (no token needed)', () => {
    cy.request('GET', '/api/theme').then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.success).to.be.true;
    });
  });

  it('TC03 - GET /api/theme returns correct content-type', () => {
    cy.request('GET', '/api/theme').then((res) => {
      expect(res.headers['content-type']).to.include('application/json');
    });
  });

  it('TC04 - PUT /api/theme updates primaryColor', () => {
    cy.authRequest({
      method: 'PUT', url: '/api/theme',
      body: { primaryColor: '#ff0000' },
    }).then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.data.primaryColor).to.eq('#ff0000');
    });
  });

  it('TC05 - PUT /api/theme updates secondaryColor', () => {
    cy.authRequest({
      method: 'PUT', url: '/api/theme',
      body: { secondaryColor: '#00ff00' },
    }).then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.data.secondaryColor).to.eq('#00ff00');
    });
  });

  it('TC06 - PUT /api/theme updates companyName', () => {
    cy.authRequest({
      method: 'PUT', url: '/api/theme',
      body: { companyName: 'Cypress Airlines' },
    }).then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.data.companyName).to.eq('Cypress Airlines');
    });
  });

  it('TC07 - PUT /api/theme updates logoUrl', () => {
    cy.authRequest({
      method: 'PUT', url: '/api/theme',
      body: { logoUrl: 'https://example.com/logo.png' },
    }).then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.data.logoUrl).to.eq('https://example.com/logo.png');
    });
  });

  it('TC08 - PUT /api/theme updates multiple fields at once', () => {
    cy.authRequest({
      method: 'PUT', url: '/api/theme',
      body: { primaryColor: '#1976d2', secondaryColor: '#dc004e', companyName: 'Airline Logistics Co.' },
    }).then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.data.primaryColor).to.eq('#1976d2');
      expect(body.data.secondaryColor).to.eq('#dc004e');
      expect(body.data.companyName).to.eq('Airline Logistics Co.');
    });
  });

  it('TC09 - PUT /api/theme blocked without token', () => {
    cy.request({
      method: 'PUT', url: '/api/theme',
      body: { companyName: 'Hacker' }, failOnStatusCode: false,
    }).then(({ status }) => expect(status).to.eq(401));
  });

  it('TC10 - PUT /api/theme response has success true', () => {
    cy.authRequest({
      method: 'PUT', url: '/api/theme',
      body: { companyName: 'Test Co.' },
    }).then(({ body }) => expect(body.success).to.be.true);
  });

  it('TC11 - GET /api/theme after update reflects new values', () => {
    cy.authRequest({ method: 'PUT', url: '/api/theme', body: { companyName: 'Verified Co.' } });
    cy.request('GET', '/api/theme').then(({ body }) => {
      expect(body.data.companyName).to.eq('Verified Co.');
    });
  });

  it('TC12 - GET /api/theme data is an object', () => {
    cy.request('GET', '/api/theme').then(({ body }) => {
      expect(body.data).to.be.an('object');
    });
  });

  it('TC13 - GET /api/theme returns _id field', () => {
    cy.request('GET', '/api/theme').then(({ body }) => {
      if (body.data) expect(body.data).to.have.property('_id');
    });
  });

  it('TC14 - PUT /api/theme with invalid token returns 401', () => {
    cy.request({
      method: 'PUT', url: '/api/theme',
      headers: { Authorization: 'Bearer faketoken' },
      body: { companyName: 'Fake' }, failOnStatusCode: false,
    }).then(({ status }) => expect(status).to.eq(401));
  });

  it('TC15 - PUT /api/theme upserts when no theme exists', () => {
    cy.authRequest({
      method: 'PUT', url: '/api/theme',
      body: { primaryColor: '#123456', companyName: 'Upsert Test' },
    }).then(({ status }) => expect(status).to.eq(200));
  });
});
