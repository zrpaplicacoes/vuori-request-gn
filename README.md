# Vuori Request GN (WARNING: Not production ready yet!)


## Installation

```npm install vuori-request-gn```
or
```yarn add vuori-request-gn```

## Usage

### 1. In development:

```js

{ RequestGn, Database } = require('vuori-request-gn');

const dbConfig = {
  endpoint: "http://dynamo:8000'", // Connect to localhost
};

await Database.dbConnect(dbConfig);

const requestGn = new RequestGn({
  GN_PASSWORD: process.env.GN_PASSWORD,
  GN_USER: process.env.GN_USER,
  baseURL: process.env.GN_URL,
});

requestGn.setup();

response = await requestGn.getProductsByAgent('AG 145');
```

### 2. In production/staging (let AWS roles control access):

```js

{ RequestGn, Database } = require('vuori-request-gn');
const AWS = require('aws-sdk');

Database.useDb(new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
}));

const requestGn = new RequestGn({
  GN_PASSWORD: process.env.GN_PASSWORD,
  GN_USER: process.env.GN_USER,
  baseURL: process.env.GN_URL,
});

requestGn.setup();

response = await requestGn.getProductsByAgent('AG 145');
```

## Methods

- getProductsByAgent(agentCode)
- saveClient(clientData)
- getClient(cpf)
- editClient(clientData)
- saveTransaction(transactionData)
- saveDeliveryAddress(deliveryAddressData)
