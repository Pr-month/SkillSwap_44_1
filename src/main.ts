import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig, TAppConfig } from './common/config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<TAppConfig>(appConfig.KEY);
  await app.listen(config.port);
}
bootstrap();
