const RequestGn = require('./../index').RequestGn;
const Database = require('./../index').Database;
const dynamoCleaner = require('./helpers/dynamoCleaner');
const nock = require('nock');
const vuoriResponse = require('./support/vuoriSucessProductsResponse.json');
const vuoriToken = require('./support/vuoriTokenResponse.json');
const dynamoFunctions = require('./../services/vuoriConfiguration');

describe('requestGn service test', () => {
  let saveToken;
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
    Database.dbConnect(dbConfig);
    saveToken = dynamoFunctions().saveToken;
  }, 7000);

  describe('test a vuori request with a invalid token in database', () => {
    let response;
    beforeAll(async () => {
      let hasRequestedOnce = false;
      nock(process.env.GN_URL)
        .log(console.log)
        .persist()
        .get('/api/ecommerce/v2/produto/tipo/ESPECIE?cdAgente=AG+145')
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

      const requestGn = new RequestGn(config);
      requestGn.setup();
      await saveToken('InvalidToken');
      response = await requestGn.getProductsByAgent('AG 145');

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
        .get('/api/ecommerce/v2/produto/tipo/ESPECIE?cdAgente=AG+145')
        .reply(200, vuoriResponse)
        .post('/api/ecommerce/v2/token')
        .reply(200, vuoriToken);
      const requestGn = new RequestGn(config);
      requestGn.setup();
      response = await requestGn.getProductsByAgent('AG 145');
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
        .get('/api/ecommerce/v2/produto/tipo/ESPECIE?cdAgente=AG+145')
        .reply(200, vuoriResponse)
        .post('/api/ecommerce/v2/token')
        .reply(200, vuoriToken);
      const requestGn = new RequestGn(config);
      requestGn.setup();
      await requestGn.authenticateGn();
      response = await requestGn.getProductsByAgent("AG 145");
    });
    test('should be a valid request', () => {
      expect(response.status).toEqual(200);
    });
  });
});
