const RequestGn = require('./../index').RequestGn;
const dynamoCleaner = require('./helpers/dynamoCleaner');
const nock = require('nock');
const vuoriDeliveryAddressData = require('./support/vuoriDeliveryAddressData.json');
const vuoriToken = require('./support/vuoriTokenResponse.json');
const vuoriResponse= require('./support/vuoriSucessDeliveryAddressResponse.json');

describe('test a vuori request for a save delivery address', () => {
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
        .post('/api/ecommerce/v2/clienteentrega')
        .reply(200, vuoriResponse)
        .post('/api/ecommerce/v2/token')
        .reply(200, vuoriToken);
      const requestGn = new RequestGn(config);
      requestGn.setup();
      try {
        response = await requestGn.saveDeliveryAddress(vuoriDeliveryAddressData);
      } catch (error) {
        response = error.response;
      }
    });
    test('should be a valid request', () => {
      expect(response.status).toEqual(200);
    });
  });
});
