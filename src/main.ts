import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig, TAppConfig } from './common/config/app.config';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { AppLoggerService } from './logger/logger.service';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger/winston.config';
import { AllExceptionFilter } from './common/filters/all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
    bufferLogs: true,
  });

  const logger = await app.resolve(AppLoggerService);
  logger.setContext('Bootstrap');

  app.useLogger(logger);

  // подключаем перехватчик
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionFilter());

  const config = app.get<TAppConfig>(appConfig.KEY);
  await app.listen(config.port);
  logger.log(`Application is running on: http://localhost:${config.port}`);
  logger.log(`Environment:  ${config.nodeEnv}`);
}
bootstrap();
