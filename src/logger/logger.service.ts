import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { Logger } from 'winston';
import { Inject } from '@nestjs/common';
import { sanitizeLogData } from './sanitizer';

type LogMeta = Record<string, unknown> | undefined;

type Context = string | undefined;

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements LoggerService {
  private context?: Context;

  constructor(@Inject('winston') private readonly logger: Logger) {}

  /**
   * Устанавливает контекст для всех логов
   */
  setContext(context: string): void {
    this.context = context;
  }

  /**
   * INFO уровень - обычная информация
   */
  log(message: string, meta?: LogMeta): void {
    const normalizedMeta = this.normalizeMeta(meta);
    const sanitized = sanitizeLogData(normalizedMeta);
    this.logger.info(message, { context: this.context, ...sanitized });
  }

  /**
   * ERROR уровень - ошибки
   */
  error(message: string, trace?: string, meta?: LogMeta): void {
    const normalizedMeta = this.normalizeMeta(meta);
    const sanitized = sanitizeLogData(normalizedMeta);
    this.logger.error(message, {
      context: this.context,
      trace,
      ...sanitized,
    });
  }

  /**
   * WARN уровень - предупреждения
   */
  warn(message: string, meta?: LogMeta): void {
    const normalizedMeta = this.normalizeMeta(meta);
    const sanitized = sanitizeLogData(normalizedMeta);
    this.logger.warn(message, { context: this.context, ...sanitized });
  }

  /**
   * DEBUG уровень - отладочная информация
   */
  debug(message: string, meta?: LogMeta): void {
    const normalizedMeta = this.normalizeMeta(meta);
    const sanitized = sanitizeLogData(normalizedMeta);
    this.logger.debug(message, { context: this.context, ...sanitized });
  }

  /**
   * VERBOSE уровень - детальная информация
   */
  verbose(message: string, meta?: LogMeta): void {
    const normalizedMeta = this.normalizeMeta(meta);
    const sanitized = sanitizeLogData(normalizedMeta);
    this.logger.verbose(message, { context: this.context, ...sanitized });
  }

  /**
   * Метод для нормализации метаданных
   */
  private normalizeMeta(meta?: unknown): Record<string, unknown> {
    // null, undefined → пустой объект
    if (meta === null || meta === undefined) {
      return {};
    }

    // Если это объект и не массив → возвращаем как есть
    if (typeof meta === 'object' && !Array.isArray(meta)) {
      return meta as Record<string, unknown>;
    }

    // Если это массив → оборачиваем как { items: ... }
    if (Array.isArray(meta)) {
      return { items: meta };
    }

    // Если это строка → оборачиваем как { context: строка }
    if (typeof meta === 'string') {
      return { context: meta };
    }

    // Если это число или boolean → оборачиваем как { value: ... }
    if (typeof meta === 'number' || typeof meta === 'boolean') {
      return { value: meta };
    }

    // Всё остальное → пустой объект
    return {};
  }
}
