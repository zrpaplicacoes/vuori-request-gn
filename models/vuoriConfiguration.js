const dynogels = require('dynogels');
const Joi = require('joi');

const VuoriConfiguration = dynogels.define('VuoriConfiguration', {
  hashKey: 'config',
  timestamps: true,
  schema: {
    config: Joi.string(),
    value: Joi.string(),
  },
  tableName: `VuoriConfiguration-${process.env.NODE_ENV}`,
});

module.exports = VuoriConfiguration;
