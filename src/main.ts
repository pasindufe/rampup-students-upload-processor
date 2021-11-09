import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'POST',
    credentials: false,
  }); //need to check with best way
  await app.listen(3001);
}
bootstrap();
