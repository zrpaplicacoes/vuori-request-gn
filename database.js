const dynamoAdapter = require('./config/dynamoAdapter');

class Database {
  static useDb(dynamoAwsInstance) {
    dynamoAdapter.use(dynamoAwsInstance);
  }

  static async dbConnect(config) {
    await dynamoAdapter.connect(config)
  }
}

module.exports = Database;
