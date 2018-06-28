# Vuori Request GN (WARNING: Not production ready yet!)

## Information

Express Devise Token Auth is a general middleware that adds the ability to express projects authenticate users through a [devise-token-auth](https://github.com/lynndylanhurley/devise_token_auth) micro service running with Rails.

Basically this middleware validates token information and acts like a `before_action :authenticate_user` that we have in Rails.

## Installation

```npm install vuori-request-gn --save```

## Usage

```js

const requestGn = new RequestGn({
      GN_PASSWORD: process.env.GN_PASSWORD,
      GN_USER: process.env.GN_USER,
      baseURL: process.env.GN_URL,
});

response = await requestGn.getProductsByAgent('AG 145');
```

# Methods

- getProductsByAgent(agentCode)
- saveClient(clientData)
- getClient(cpf)