import * as winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  // format: winston.format.timestamp(),
  format: winston.format.printf(info => `${new Date().toISOString()}: ${info.message}`),
  transports: [new winston.transports.Console()],
});

if (process.env.NODE_ENV === 'local') {
  logger.add(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
  logger.add(new winston.transports.File({ filename: 'logs/combined.log' }));
}

export default logger;
