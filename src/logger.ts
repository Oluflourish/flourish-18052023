import winston from 'winston';

const { combine, timestamp, json } = winston.format;

const logger = winston.createLogger({
    level: 'debug',
    // format: winston.format.json(),
    format: combine(timestamp(), json()),
    transports: [new winston.transports.Console()],
});

logger.info('Logger is initialized');

export default logger;
