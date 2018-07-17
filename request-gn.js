const querystring = require('querystring');
const axios = require('axios');

const configurationFunctions = require('./services/vuoriConfiguration');
const logger = require('./services/logger');

class RequestGn {
  constructor(config) {
    this.baseURL = config.baseURL;
    this.GN_PASSWORD = config.GN_PASSWORD;
    this.GN_USER = config.GN_USER;
    this.axios = axios;
  };

  setup() {
    const {
      saveToken,
      getToken,
    } = configurationFunctions();

    this.saveToken = saveToken;
    this.getToken = getToken;
    this._axiosRequest();
    this._axiosResponse();

    this.gnAuthenticateRequest = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }


  async getProductsByAgent(agentCode) {
    this.options = {
      url: '/api/ecommerce/v2/produto/tipo/ESPECIE',
      method: 'get',
      baseURL: this.baseURL,
      params: {
        cdAgente: agentCode,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    const result = await this._apiRequest();
    return result;
  }

  async saveDeliveryAddress(data) {
    this.options = {
      url: '/api/ecommerce/v2/clienteentrega',
      method: 'post',
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      data,
    };

    const result = await this._apiRequest();
    return result;
  }

  async saveTransaction(data) {
    this.options = {
      url: '/api/ecommerce/v2/boleto',
      method: 'post',
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      data,
    };

    const result = await this._apiRequest();
    return result;
  }

  async saveClient(data) {
    this.options = {
      url: '/api/ecommerce/v2/cliente',
      method: 'post',
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      data,
    };

    logger.debug(`SaveClient options ${this.options}`);
    const result = await this._apiRequest();
    return result;
  }

  async editClient(data) {
    this.options = {
      url: '/api/ecommerce/v2/cliente',
      method: 'put',
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      data,
    };

    const result = await this._apiRequest();
    return result;
  }

  async getClient(clientCpf) {
    this.options = {
      url: `/api/ecommerce/v2/cliente/${clientCpf}`,
      method: 'get',
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const result = await this._apiRequest();
      return result;
    } catch (err) {
      logger.error(`error in getClient: ${err}`);
      if (err.response.status === 404) {
        return {
          status: 404,
          message: 'Usuário não encontrado'
        };
      }
      throw err;
    };
  }

  async _apiRequest() {
    let response;
    try {
      response = await this.axios.request(this.options);
    } catch (error) {
      logger.error(`error in _apiRequest: ${error}`);
      throw error;
    }
    return response;
  };

  _axiosRequest() {
    this.axios.interceptors.request.use(async (config) => {
      try {
        const newconfig = await this._addAcessTokenToRequest(config);
        return newconfig;
      } catch (error) {
        logger.info(`catch error in request: ${error}`);
        await this._requestErrorOutput(error);
      }
    });
  };

  async _addAcessTokenToRequest(config) {
    let vuoriAccessToken;

    try {
      vuoriAccessToken = await this.getToken();
      logger.debug(`Access token: ${vuoriAccessToken}`);
    } catch (err) {
      logger.error(`error in _addAcessTokenToRequest: ${err}`);
    }

    if (!vuoriAccessToken) {
      const error = 'NotFound';
      throw error;
    };
    config.headers = {
      'Authorization': `bearer ${vuoriAccessToken}`,
      'Content-Type': 'application/json;charset=UTF-8',
    };
    return config;
  }

  _requestErrorOutput(error) {
    if (error === 'NotFound') {
      const tokenNotFoundError = new Error('TokenNotFoundError');
      throw tokenNotFoundError;
    }
    throw error;
  }

  _axiosResponse() {
    this.axios.interceptors.response.use((response) => {
      return response;
    }, async (error) => {
      const result = await this._errorHandler(error);
      return result;
    });
  };

  async _errorHandler(error) {
    if (error.response && error.response.status === 401) {
      const result = await this._handlerUnauthorizedError();
      return result;
    }
    if (error.message === 'TokenNotFoundError') {
      const result = await this._handlerNotFoundError();
      return result;
    }
    return Promise.reject(error);
  };

  async _handlerUnauthorizedError() {
    try {
      await this.authenticateGn();
      const result = await this._apiRequest();
      return result;
    } catch (err) {
      logger.error(`error in _handlerUnauthorizedError: ${err}`);
      return Promise.reject(err);
    }
  }

  async _handlerNotFoundError() {
    try {
      await this.authenticateGn();
      const result = await this._apiRequest();
      return result;
    } catch (err) {
      logger.error(`error in _handlerNotFoundError: ${err}`);
      return Promise.reject(err);
    }
  }

  async authenticateGn() {
    try {
      const reqBody = querystring.stringify({
        'grant_type': 'password',
        'username': this.GN_USER,
        'password': this.GN_PASSWORD,
      });
      const responseToken = await this.gnAuthenticateRequest.post(
        '/api/ecommerce/v2/token',
        reqBody,
      );
      const accessToken = await this.saveToken(responseToken.data.access_token);
      return accessToken;
    } catch (error) {
      logger.info(`error in authenticateGn: ${error}`);
      throw error;
    }
  };

}

module.exports = RequestGn;
