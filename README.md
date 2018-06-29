# Vuori Request GN (WARNING: Not production ready yet!)


## Installation

```npm install vuori-request-gn```
or
```yarn add vuori-request-gn```

## Usage

```js

const RequestGn = require('vuori-request-gn');

const requestGn = new RequestGn({
      GN_PASSWORD: process.env.GN_PASSWORD,
      GN_USER: process.env.GN_USER,
      baseURL: process.env.GN_URL,
});

const dbConfig = {
      endpoint: "http://dynamo:8000'", // Connect to localhost
      env: "development",
};

await requestGn.dbConnect(dbConfig);

response = await requestGn.getProductsByAgent('AG 145');
```

## Methods

- getProductsByAgent(agentCode)
- saveClient(clientData)
- getClient(cpf)
- saveTransaction(transactionDat)