const RequestGn = require('./../index').RequestGn;
const dynamoCleaner = require('./helpers/dynamoCleaner');
const nock = require('nock');
const vuoriTransactionData = require('./support/vuoriTransactionData.json');
const vuoriToken = require('./support/vuoriTokenResponse.json');
const vuoriResponse = require('./support/vuoriSucessTransactionResponse.json');
const vuoriBadrequestResponse = require('./support/vuoriBadRequestResponse.json');
describe('test a vuori request for a save transaction', () => {
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
  describe('with a valid request ', () => {
    let response;
    let err;
    beforeAll(async () => {
      nock(process.env.GN_URL)
        .post('/api/ecommerce/v2/boleto')
        .reply(200, vuoriResponse)
        .post('/api/ecommerce/v2/token')
        .reply(200, vuoriToken);
      const requestGn = new RequestGn(config);
      requestGn.setup();
      response = await requestGn.saveTransaction(vuoriTransactionData);
    });
    test('should be a valid request', () => {
      expect(response.status).toEqual(200);
    });
  });
  describe('with a invalid request ', () => {
    let mySpy;
    let err;
    beforeAll(async () => {
      nock(process.env.GN_URL)
        .post('/api/ecommerce/v2/boleto')
        .reply(400, vuoriBadrequestResponse)
        .post('/api/ecommerce/v2/token')
        .reply(200, vuoriToken);
      const requestGn = new RequestGn(config);
      requestGn.setup();
      mySpy = jest.spyOn(requestGn, '_serializeError');
      try {
        await requestGn.saveTransaction(vuoriTransactionData);
      } catch (error) {
        err = error;
      }
    });
    test('should be a bad request', () => {
      expect(err.response.status).toEqual(400);
      expect(mySpy).toHaveReturnedWith({
        "payload": {
          "CdAgente": "SILVIO",
          "CdCliente": "040809 001",
          "CdFilial": "007",
          "CdFormaEntregaMe": "50",
          "CdProduto": "USD",
          "CdStatus": "P",
          "CdTipoProduto": "ESPECIE",
          "DtVenda": "2018-07-03T00:00:00",
          "FormaMn": "TED",
          "IdClienteEntrega": 1279,
          "IdTaxa": "e58c6624-7782-45ac-b553-892496e9a996",
          "Iof": 3.56,
          "LocalEntrega": "DELIVERY",
          "ValorDespesa": 0,
          "ValorMe": 100,
          "ValorMn": 323.4,
          "ValorTaxa": 3.23398
        },
        "response": {
          "Message": "The request is invalid.",
          "ModelState": {
            "Email": [" - Email deve ser informado", " - Informe um email válido"]
          }
        },
        "status": 400
      });
    });
  });
});