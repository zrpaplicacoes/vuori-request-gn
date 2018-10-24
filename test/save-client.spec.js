const RequestGn = require('./../index').RequestGn;
const dynamoCleaner = require('./helpers/dynamoCleaner');
const nock = require('nock');
const vuoriClientData = require('./support/vuoriClientData.json');
const vuoriToken = require('./support/vuoriTokenResponse.json');
const vuoriResponse = require('./support/vuoriSucessClientsResponse.json');
const vuoriBadrequestResponse = require('./support/vuoriBadRequestResponse.json');

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
  describe('with a existent client ', () => {
    let error;
    let mySpy;
    beforeAll(async () => {
      nock(process.env.GN_URL)
        .post('/api/ecommerce/v2/cliente')
        .reply(400, vuoriBadrequestResponse)
        .post('/api/ecommerce/v2/token')
        .reply(200, vuoriToken);
      const requestGn = new RequestGn(config);
      requestGn.setup();

      mySpy = jest.spyOn(requestGn, '_serializeError');
      try {
        await requestGn.saveClient(vuoriClientData);
      } catch (err) {
        error = err;
      }
    });
    test('should be a bad request', () => {
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
      expect(error.response.status).toEqual(400);
    });
  });
  describe('with a valid request', () => {
    let response;
    beforeAll(async () => {
      nock(process.env.GN_URL)
        .post('/api/ecommerce/v2/cliente')
        .reply(201, vuoriResponse)
        .post('/api/ecommerce/v2/token')
        .reply(200, vuoriToken);
      const requestGn = new RequestGn(config);
      requestGn.setup();
      response = await requestGn.saveClient(vuoriClientData);
    });
    test('should be a created request', () => {
      expect(response.status).toEqual(201);
    });
  });
});