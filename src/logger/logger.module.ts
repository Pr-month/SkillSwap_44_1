import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './winston.config';
import { AppLoggerService } from './logger.service';

/**
 * ГЛОБАЛЬНЫЙ МОДУЛЬ ЛОГГЕРА
 */
@Global()
@Module({
  imports: [WinstonModule.forRoot(winstonConfig)],
  providers: [AppLoggerService],
  exports: [AppLoggerService],
})
export class LoggerModule {}
