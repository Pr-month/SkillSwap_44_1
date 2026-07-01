type RedactedValue = `[REDACTED:${string}]`;

type Sanitized<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends object
        ? Sanitized<T[K]>
        : T[K] extends string | number | boolean | null | undefined
          ? T[K] | RedactedValue
          : T[K];
    }
  : T | RedactedValue;

type SensitivePattern = RegExp;

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

const isSensitiveKey = (key: string): boolean => {
  return sensitivePatterns.some((pattern) => pattern.test(key));
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

export const sanitizeLogData = <T>(
  data: T,
  depth: number = 0,
  maxDepth: number = 10,
): Sanitized<T> => {
  if (depth > maxDepth) {
    return '[MAX_DEPTH_REACHED]' as Sanitized<T>;
  }

  if (!isObject(data)) {
    return data as Sanitized<T>;
  }

  if (isArray(data)) {
    const sanitizedArray = data.map((item) =>
      sanitizeLogData(item, depth + 1, maxDepth),
    );
    return sanitizedArray as Sanitized<T>;
  }

  const result: Record<string, unknown> = {};

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = (data as Record<string, unknown>)[key];

      if (isSensitiveKey(key)) {
        const valueType = typeof value;
        result[key] = `[REDACTED:${valueType}]`;
        continue;
      }
      if (isObject(value)) {
        result[key] = sanitizeLogData(value, depth + 1, maxDepth);
        continue;
      }

      result[key] = value;
    }
  }

  return result as Sanitized<T>;
};
