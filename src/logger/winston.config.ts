import * as winston from 'winston';
import 'winston-daily-rotate-file';
import type { LoggerOptions } from 'winston';
import { appConfig } from '../common/config/app.config';

const config = appConfig();

const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    ({ timestamp, level, message, context, trace, ...meta }) => {
      const safeStringify = (value: unknown): string => {
        try {
          return JSON.stringify(value, null, 2);
        } catch {
          return '[unserializable]';
        }
      };

      const timestampStr = typeof timestamp === 'string' ? timestamp : '';

      const contextStr = typeof context === 'string' ? context : 'App';

      const messageStr =
        typeof message === 'string' ? message : JSON.stringify(message);

      const traceStr = typeof trace === 'string' ? trace : '';

      const metaKeys = Object.keys(meta);

      const lines = [
        `${timestampStr} ${level.toUpperCase().padEnd(5)} [${contextStr}] ${messageStr}`,
      ];

      if (metaKeys.length > 0) {
        lines.push(safeStringify(meta));
      }

      if (traceStr) {
        lines.push(`Stack:\n${traceStr}`);
      }

      return lines.join('\n');
    },
  ),
);

const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json({
    replacer: (key, value) => {
      const sensitiveFields = [
        'password',
        'token',
        'apiKey',
        'secret',
        'authorization',
        'cookie',
        'creditCard',
        'ssn',
        'privateKey',
      ];

      if (
        sensitiveFields.some((field) =>
          key.toLowerCase().includes(field.toLowerCase()),
        )
      ) {
        return '[REDACTED]';
      }

      return value;
    },
  }),
);

export const winstonConfig: LoggerOptions = {
  level:
    config.logLevel || (config.nodeEnv === 'production' ? 'info' : 'debug'),

  transports: ((): winston.transport[] => {
    if (config.nodeEnv === 'production') {
      return [
        new winston.transports.Console({
          format: productionFormat,
        }),
        new winston.transports.DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: productionFormat,
        }),
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          level: 'error',
          format: productionFormat,
        }),
      ];
    }

    return [
      new winston.transports.Console({
        format: developmentFormat,
      }),
      new winston.transports.DailyRotateFile({
        filename: 'logs/dev-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '10m',
        maxFiles: '7d',
        format: developmentFormat,
      }),
    ];
  })(),

  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: productionFormat,
    }),
  ],

  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: productionFormat,
    }),
  ],
};
