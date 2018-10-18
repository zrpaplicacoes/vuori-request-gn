const RequestGn = require('./../index').RequestGn;
const dynamoCleaner = require('./helpers/dynamoCleaner');
const nock = require('nock');
const vuoriResponse = require('./support/vuoriSucessProductsResponse.json');
const vuoriToken = require('./support/vuoriTokenResponse.json');

describe('test a vuori request for a user', () => {
  beforeAll(async () => {

    config = {
      GN_PASSWORD: process.env.GN_PASSWORD,
      GN_USER: process.env.GN_USER,
      baseURL: process.env.GN_URL,
    };

    const dbConfig = {
      endpoint: "http://dynamo:8000'",
      env: "test",
    };
    await dynamoCleaner.clean(dbConfig);
  }, 7000);
  describe('with a invalid cpf', () => {
    let response;
    beforeAll(async () => {
      nock(process.env.GN_URL)
        .get('/api/ecommerce/v2/cliente/00000000000')
        .reply(404)
        .post('/api/ecommerce/v2/token')
        .reply(200, vuoriToken);
      const requestGn = new RequestGn(config);
      requestGn.setup();
      response = await requestGn.getClient('00000000000');
    });
    test('should be a not found request', () => {
      expect(response.status).toEqual(404);
    });
  });
  describe('with a valid cpf', () => {
    let response;
    beforeAll(async () => {
      nock(process.env.GN_URL)
        .get('/api/ecommerce/v2/cliente/01234567890')
        .reply(200, vuoriResponse)
        .post('/api/ecommerce/v2/token')
        .reply(200, vuoriToken);
      const requestGn = new RequestGn(config);
      requestGn.setup();
      response = await requestGn.getClient('01234567890');
    });
    test('should be a valid request', () => {
      expect(response.status).toEqual(200);
    });
  });
});
