import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig, TAppConfig } from './common/config/app.config';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { ClassSerializerInterceptor } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // подключаем перехватчик
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = app.get<TAppConfig>(appConfig.KEY);
  await app.listen(config.port);
}
bootstrap();
