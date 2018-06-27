const RequestGn = require('./../index');
const dynamoCleaner = require('./helpers/dynamoCleaner');
const nock = require('nock');
const vuoriResponse = require('./support/vuoriSucessProductsResponse.json');
const vuoriToken = require('./support/vuoriTokenResponse.json');
const {
  saveToken,
} = require('./../services/vuoriConfiguration')();

describe('requestGn service test', () => {
  let options;
  beforeAll(async () => {
    options = {
      url: '/api/ecommerce/v2/produto/tipo/ESPECIE/',
      method: 'get',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    await dynamoCleaner.clean();
  }, 7000);

  describe('test a vuori request with a invalid token in database', () => {
    let response;
    beforeAll(async () => {
      const requestGn = new RequestGn(options);
      await saveToken('InvalidToken');
      response = await requestGn.apiRequest();
      let hasRequestedOnce = false;

      nock(process.env.GN_URL)
        .log(console.log)
        .persist()
        .get('/api/ecommerce/v2/produto/tipo/ESPECIE/')
        .reply(() => {
          if (hasRequestedOnce) {
            return [
              200,
              vuoriResponse,
            ];
            hasRequestedOnce = true;
            return [
              401,
              {
                'Message': 'Authorization has been denied for this request.',
              },
            ];
          }
        })
        .post('/api/ecommerce/v2/token')
        .reply(200, vuoriToken);
    });
    test('should be a valid request', () => {
      expect(response.status).toEqual(200);
    });
  });

  describe('test a vuori request with no token in database', () => {
    let response;
    beforeAll(async () => {
      nock(process.env.GN_URL)
      .log(console.log)
      .persist()
      .get('/api/ecommerce/v2/produto/tipo/ESPECIE/')
      .reply(200, vuoriResponse)
      .post('/api/ecommerce/v2/token')
      .reply(200, vuoriToken);
      const requestGn = new RequestGn(options);
      response = await requestGn.apiRequest();
    });
    test('should be a valid request', () => {
      expect(response.status).toEqual(200);
    });
  });
  describe('test a vuori request with a valid token in database', () => {
    let response;
    beforeAll(async () => {
      nock(process.env.GN_URL)
      .log(console.log)
      .persist()
      .get('/api/ecommerce/v2/produto/tipo/ESPECIE/')
      .reply(200, vuoriResponse)
      .post('/api/ecommerce/v2/token')
      .reply(200, vuoriToken);

      const requestGn = new RequestGn(options);
      await requestGn.authenticateGn();
      response = await requestGn.apiRequest();
    });
    test('should be a valid request', () => {
      expect(response.status).toEqual(200);
    });
  });
});
