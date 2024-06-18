import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PORT } from './shared/constants';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  await app.listen(PORT);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  console.log('App is listening on port ', PORT);
}
bootstrap();
