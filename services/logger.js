const winston = require('winston');
const format = winston.format;
const { combine, timestamp, printf } = format;

const errorFormat = printf(info => {
  return `${info.timestamp} [VuoriRequestGnError] ${info.level}: ${info.message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV == 'production' ? 'info' : 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: combine(
        timestamp(),
        errorFormat
      )
    })
  ]
});

module.exports = logger;
