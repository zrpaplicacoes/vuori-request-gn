const AWS = require('aws-sdk');
const dynogels = require('dynogels');
const logger = require('../services/logger');

module.exports = {
  async use(db) {
    dynogels.dynamoDriver(db);
    await this.setup();
  },

  async connect(config) {
    const {
      endpoint,
      region
    } = config;

    this.setupDevKeys(region);

    let awsConfig = {
      apiVersion: '2012-08-10',
    };

    awsConfig = Object.assign(config, {
      endpoint,
    });

    const db = new AWS.DynamoDB(awsConfig);
    dynogels.dynamoDriver(db);

    await this.setup(endpoint);
  },

  setupDevKeys(awsRegion = 'us-east-1') {
    AWS.config.update({
      accessKeyId: 'dummy',
      secretAccessKey: 'dummy',
      region: awsRegion
    });
  },

  async setup(endpoint = undefined) {
    return new Promise((resolve, reject) => {
      dynogels.createTables((err) => {
        if (err) {
          logger.error('error in createTables', err);
          reject(err);
          return;
        }
        resolve(true);

        if (endpoint) {
          logger.info(`using dynamodb at: ${endpoint}`);
        } else {
          logger.info('using dynamodb with policies');
        }
      });
    });
  },
};
