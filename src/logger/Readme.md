### 🎯 Базовое использование

```typescript
import { Injectable } from '@nestjs/common';
import { AppLoggerService } from './logger/logger.service';

@Injectable()
export class UserService {
  // Инъекция логгера
  constructor(private readonly logger: AppLoggerService) {
    // Устанавливаем контекст (имя класса)
    this.logger.setContext(UserService.name);
  }

  async findUser(id: number) {
    // ✅ INFO - обычная информация
    this.logger.log('Fetching user', { userId: id });

    try {
      const user = await this.userRepository.findOne(id);
      return user;
    } catch (error) {
      // ✅ ERROR - ошибки с stack trace
      this.logger.error(
        'Failed to fetch user',
        error.stack,
        { userId: id, errorCode: error.code }
      );
      throw error;
    }
  }

  async updateUser(id: number, data: UpdateUserDto) {
    // ✅ DEBUG - детальная отладочная информация
    this.logger.debug('Updating user', { userId: id, data });

    // ... логика

    // ✅ WARN - потенциальные проблемы
    if (!data.email) {
      this.logger.warn('Email not provided', { userId: id });
    }
  }
}
```

### 📊 Уровни логирования

| Уровень | Метод | Использование |
|---------|-------|---------------|
| `log` | `this.logger.log()` | Обычная информация |
| `debug` | `this.logger.debug()` | Отладка |
| `warn` | `this.logger.warn()` | Предупреждения |
| `error` | `this.logger.error()` | Ошибки |
| `verbose` | `this.logger.verbose()` | Детальная информация |

### 🔒 Безопасность

Логгер автоматически скрывает чувствительные данные:
- Пароли → `[REDACTED:string]`
- Токены → `[REDACTED:string]`
- API ключи → `[REDACTED:string]`

```typescript