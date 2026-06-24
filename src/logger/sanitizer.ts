/**
 * Тип для значений, которые могут быть заредактированы
 */
type RedactedValue = `[REDACTED:${string}]`;

/**
 * Тип для результата санитизации
 * Рекурсивно применяется ко всем вложенным объектам
 */
type Sanitized<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends object
        ? Sanitized<T[K]>
        : T[K] extends string | number | boolean | null | undefined
          ? T[K] | RedactedValue
          : T[K];
    }
  : T | RedactedValue;

/**
 * Тип для чувствительных паттернов
 */
type SensitivePattern = RegExp;

/**
 * Список чувствительных паттернов
 */
const sensitivePatterns: SensitivePattern[] = [
  /password/i,
  /token/i,
  /api[_-]?key/i,
  /secret/i,
  /authorization/i,
  /bearer/i,
  /cookie/i,
  /session/i,
  /credit[_-]?card/i,
  /cvv/i,
  /ssn/i,
  /private[_-]?key/i,
  /access[_-]?key/i,
  /refresh[_-]?token/i,
  /jwt/i,
  /auth/i,
];

/**
 * Проверяет, является ли ключ чувствительным
 */
const isSensitiveKey = (key: string): boolean => {
  return sensitivePatterns.some((pattern) => pattern.test(key));
};

/**
 * Проверяет, является ли значение объектом (и не null)
 */
const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

/**
 * Проверяет, является ли значение массивом
 */
const isArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

/**
 * Основная функция санитизации
 */
export const sanitizeLogData = <T>(
  data: T,
  depth: number = 0,
  maxDepth: number = 10,
): Sanitized<T> => {
  // Защита от бесконечной рекурсии
  if (depth > maxDepth) {
    return '[MAX_DEPTH_REACHED]' as Sanitized<T>;
  }

  // Если data — null или не объект, возвращаем как есть
  if (!isObject(data)) {
    return data as Sanitized<T>;
  }

  // Обработка массива
  if (isArray(data)) {
    const sanitizedArray = data.map((item) =>
      sanitizeLogData(item, depth + 1, maxDepth),
    );
    return sanitizedArray as Sanitized<T>;
  }

  // Обработка объекта
  const result: Record<string, unknown> = {};

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = (data as Record<string, unknown>)[key];

      // Если ключ чувствительный — редактируем
      if (isSensitiveKey(key)) {
        const valueType = typeof value;
        result[key] = `[REDACTED:${valueType}]`;
        continue;
      }

      // Рекурсивная обработка вложенных объектов
      if (isObject(value)) {
        result[key] = sanitizeLogData(value, depth + 1, maxDepth);
        continue;
      }

      // Примитивные значения
      result[key] = value;
    }
  }

  return result as Sanitized<T>;
};
