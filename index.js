const querystring = require('querystring');
const dynamoAdapter = require('./config/dynamoAdapter');
const axios = require('axios');

const {
  saveToken,
  getToken,
} = require('./services/vuoriConfiguration')();

class RequestGn {
  constructor(config) {
    this.baseURL = config.baseURL;
    this.GN_PASSWORD = config.GN_PASSWORD;
    this.GN_USER = config.GN_USER;
    this.axios = axios;
    this._axiosRequest();
    this._axiosResponse();

    this.gnAuthenticateRequest = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  };

  async dbConnect(config) {
    dynamoAdapter.connect(config)
      .then(() => {
        server.listen(port);
        server.on('error', onError);
        server.on('listening', onListening);
      })
      .catch((error) => {
        throw error
      });
  }

  async getProductsByAgent(agentCode) {
    const options = {
      url: '/api/ecommerce/v2/produto/tipo/ESPECIE',
      method: 'get',
      baseURL:  this.baseURL,
      params: {
        cdAgente: agentCode,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    const result = await this.apiRequest(options);
    return result;
  }

  async saveClient(data) {
    const options = {
      url: '/api/ecommerce/v2/cliente',
      method: 'post',
      baseURL:  this.baseURL,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      data,
    };
    
    const result = await this.apiRequest(options);
    return result;
  }

  async saveTransaction(data) {
    const options = {
      url: '/api/ecommerce/v2/boleto',
      method: 'post',
      baseURL:  this.baseURL,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      data,
    };
    
    const result = await this.apiRequest(options);
    return result;
  }

  async getClient(clientCpf) {
    const options = {
      url: `/api/ecommerce/v2/cliente/${clientCpf}`,
      method: 'get',
      baseURL:  this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    const result = await this.apiRequest(options);
    return result;
  }

  async apiRequest(options) {
    let response;
    try {
      response = await axios.request(options);
    } catch (error) {
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
        await this._requestErrorOutput(error);
      }
    });
  };

  async _addAcessTokenToRequest(config) {
    const vuoriAccessToken = await getToken();
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
    axios.interceptors.response.use((response) => {
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
    throw error;
  };
  async _handlerUnauthorizedError(responseError) {
    try {
      await this.authenticateGn();
      const result = await this.apiRequest();
      return result;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  async _handlerNotFoundError(responseError) {
    try {
      await this.authenticateGn();
      const result = await this.apiRequest();
      return result;
    } catch (err) {
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
      const accessToken = await saveToken(responseToken.data.access_token);
      return accessToken;
    } catch (error) {
      throw error;
    }
  };
};

module.exports = RequestGn;