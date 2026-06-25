import * as winston from 'winston';
import 'winston-daily-rotate-file';
import type { LoggerOptions } from 'winston';
import { appConfig } from '../common/config/app.config';

const config = appConfig();

/**
 * 🎨 ФОРМАТ ДЛЯ РАЗРАБОТКИ
 */
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    ({ timestamp, level, message, context, trace, ...meta }) => {
      // Универсальное преобразование в строку с проверкой
      const toString = (value: unknown, fallback: string = ''): string => {
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return String(value);
        if (typeof value === 'boolean') return String(value);
        if (value === null || value === undefined) return fallback;

        // Если это объект — возвращаем fallback или JSON
        if (typeof value === 'object') {
          try {
            return JSON.stringify(value);
          } catch {
            return fallback || '[unserializable]';
          }
        }
        // Если что-то другое (символ, функция) — fallback
        return fallback;
      };

      const timestampStr = toString(timestamp);
      const contextStr = toString(context, 'App');
      const traceStr = toString(trace);
      const messageStr = toString(message);

      let log = `🕐 ${timestampStr} | ${level} | 📦 [${contextStr}]`;
      log += `\n   💬 ${messageStr}`;

      const metaKeys = Object.keys(meta);
      if (metaKeys.length > 0) {
        log += `\n   📋 ${JSON.stringify(meta, null, 2)}`;
      }

      if (traceStr) {
        log += `\n   ⚠️  Stack:\n${traceStr}`;
      }

      return log;
    },
  ),
);

/**
 * ФОРМАТ ДЛЯ PRODUCTION
 */
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

/**
 * ГЛАВНАЯ КОНФИГУРАЦИЯ С РОТАЦИЕЙ
 */
export const winstonConfig: LoggerOptions = {
  level:
    config.logLevel || (config.nodeEnv === 'production' ? 'info' : 'debug'),

  transports: ((): winston.transport[] => {
    // === PRODUCTION ===
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

    // === DEVELOPMENT ===
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
