const RequestGn = require('./../index').RequestGn;
const dynamoCleaner = require('./helpers/dynamoCleaner');
const nock = require('nock');
const vuoriNewClientData = require('./support/vuoriClientData.json');
const vuoriToken = require('./support/vuoriTokenResponse.json');
const vuoriResponse = require('./support/vuoriSucessClientsResponse.json');

describe('test a vuori request for a user', () => {
  let options;
  let credentials;
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
  describe('with a valid request', () => {
    let response;
    beforeAll(async () => {
      nock(process.env.GN_URL)
        .put('/api/ecommerce/v2/cliente')
        .reply(200, vuoriResponse)
        .post('/api/ecommerce/v2/token')
        .reply(200, vuoriToken);
      const requestGn = new RequestGn(config);
      requestGn.setup();
      response = await requestGn.editClient(vuoriNewClientData);
    });
    test('should be a created request', () => {
      expect(response.status).toEqual(200);
    });
  });
});
