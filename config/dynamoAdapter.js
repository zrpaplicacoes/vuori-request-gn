const AWS = require('aws-sdk');
const dynogels = require('dynogels');

module.exports = {
  async use(db) {
    dynogels.dynamoDriver(db);
  },

  async connect(config) {
    const {
      endpoint,
      region,
      env
    } = config;

    const awsRegion = region || 'us-east-1';
    this.configAws(awsRegion, env);


    let awsConfig = {
      apiVersion: '2012-08-10',
    };

    if (env !== 'production' && env !== 'staging') {
      awsConfig = Object.assign(config, {
        endpoint,
      });
    };

    const db = new AWS.DynamoDB(awsConfig);
    dynogels.dynamoDriver(db);
    await this.setup(endpoint);
  },

  configAws(region, env) {
    AWS.config.update({
      region: region,
    });

    this.setupDevKeys(env);
  },

  setupDevKeys(env) {
    if (env !== 'production' && env !== 'staging') {
      AWS.config.update({
        accessKeyId: 'dummy',
        secretAccessKey: 'dummy',
        region: 'us-east-1',
      });
    }
  },

  async setup(endpoint) {
    return new Promise((resolve, reject) => {
      dynogels.createTables((err) => {
        if (err) {
          console.log('ERROR while creating tables: ', err);
          reject(err);
          return;
        }
        resolve(true);
        console.info(`using dynamodb at: ${endpoint}`);
      });
    });
  },
};
