const {
  promisify
} = require('util');
const logger = require('./logger');

module.exports = function () {
  const { VuoriConfiguration } = require('./../models');
  const saveTokenPromisse = promisify(VuoriConfiguration.create);
  const getTokenPromisse = promisify(VuoriConfiguration.get);

  return {
    saveToken(accessToken) {
      return saveTokenPromisse({
        config: 'access-token',
        value: accessToken
      });
    },
    async getToken() {
      const vuoriConfig = await getTokenPromisse('access-token');
      if (!vuoriConfig) {
        return false;
      } else {
        return vuoriConfig.get('value');
      }
    },
  };
};
