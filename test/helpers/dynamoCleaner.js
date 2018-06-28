const dynamoAdapter = require('./../../config/dynamoAdapter');
const {VuoriConfiguration} = require('./../../models');
const DatabaseCleaner = {
  async connect(config) {
    return dynamoAdapter.connect(config);
  },

  async clean(config) {
    await this.connect(config);
    await this.destroyDatabases();
    await this.connect(config);
  },

  destroyDatabases() {
    return this.destroyVuoriConfigurationDatabase();
  },

  destroyVuoriConfigurationDatabase() {
    return new Promise((resolve, reject) => {
      VuoriConfiguration.deleteTable((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },
};

module.exports = DatabaseCleaner;
