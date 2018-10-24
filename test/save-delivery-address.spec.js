const RequestGn = require('./../index').RequestGn;
const dynamoCleaner = require('./helpers/dynamoCleaner');
const nock = require('nock');
const vuoriDeliveryAddressData = require('./support/vuoriDeliveryAddressData.json');
const vuoriToken = require('./support/vuoriTokenResponse.json');
const vuoriResponse = require('./support/vuoriSucessDeliveryAddressResponse.json');
const vuoriBadrequestResponse = require('./support/vuoriBadRequestResponse.json');

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
      response = await requestGn.saveDeliveryAddress(vuoriDeliveryAddressData);
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
        .post('/api/ecommerce/v2/clienteentrega')
        .reply(400, vuoriBadrequestResponse)
        .post('/api/ecommerce/v2/token')
        .reply(200, vuoriToken);
      const requestGn = new RequestGn(config);
      requestGn.setup();
      mySpy = jest.spyOn(requestGn, '_serializeError');
      try {
        await requestGn.saveDeliveryAddress(vuoriDeliveryAddressData);
      } catch (error) {
        err = error;
      }
    });
    test('should be a bad request', () => {
      expect(err.response.status).toEqual(400);
      expect(mySpy).toHaveReturnedWith({
        "payload": {
          "Bairro": "Moema",
          "CdCliente": "040300 001",
          "Cep": "04520012",
          "Cidade": "Sao Paulo",
          "Complemento": "apt 54",
          "Endereco": "Rua Inhambu",
          "Estado": "SP",
          "Numero": "632",
          "Principal": "N",
          "Responsavel": "Teste de Responsavel",
          "Telefone": "1231231231"
        },
        "response": {
          "Message": "The request is invalid.",
          "ModelState": {
            "Email": [" - Email deve ser informado", " - Informe um emailválido"]
          }
        },
        "status": 400
      });
    });
  });
});