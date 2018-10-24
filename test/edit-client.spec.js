const RequestGn = require('./../index').RequestGn;
const dynamoCleaner = require('./helpers/dynamoCleaner');
const nock = require('nock');
const vuoriNewClientData = require('./support/vuoriClientData.json');
const vuoriToken = require('./support/vuoriTokenResponse.json');
const vuoriResponse = require('./support/vuoriSucessClientsResponse.json');
const vuoriBadrequestResponse = require('./support/vuoriBadRequestResponse.json');

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
  describe('with a invalid request ', () => {
    let mySpy;
    let err;
    beforeAll(async () => {
      nock(process.env.GN_URL)
        .put('/api/ecommerce/v2/cliente')
        .reply(400, vuoriBadrequestResponse)
        .post('/api/ecommerce/v2/token')
        .reply(200, vuoriToken);
      const requestGn = new RequestGn(config);
      requestGn.setup();
      mySpy = jest.spyOn(requestGn, '_serializeError');
      try {
        await requestGn.editClient(vuoriNewClientData);
      } catch (error) {
        err = error;
      }
    });
    test('should be a bad request', () => {
      expect(err.response.status).toEqual(400);
      expect(mySpy).toHaveReturnedWith({
        "payload": {
          "Bairro": "PACAEMBU",
          "Bloqueio": "N",
          "CdFilial": "007",
          "Celular": "981931007",
          "Cep": "01235020",
          "Cidade": "SÃO PAULO",
          "Comissionado": "",
          "DddCelular": "11",
          "DddTelefone": "11",
          "Documento": "085.046.233-94",
          "DtInclusao": "2017-07-04T00:00:00",
          "DtNascimento": "1958-03-02T00:00:00",
          "Email": "sergiop@conam.eng.br",
          "Endereco": "RUA CONSELHEIRO FERNANDES TORRES",
          "Estado": "SP",
          "LojaVirtual": false,
          "Nome": "TESTE TESTINHA DA SILVA",
          "Numero": "50 - APTO.71",
          "Rg": "276.505.213-2",
          "Telefone": "37148611"
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