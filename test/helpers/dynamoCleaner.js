const dynamoAdapter = require('./../../config/dynamoAdapter');
const {VuoriConfiguration} = require('./../../models/');
const DatabaseCleaner = {
  async connect() {
    return dynamoAdapter.connect();
  },

  async clean() {
    await this.connect();
    await this.destroyDatabases();
    await this.connect();
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
