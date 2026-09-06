import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as expressHandlebars from 'express-handlebars';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Настройка статических файлов (CSS)
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Настройка папки с шаблонами
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  
  // Настройка Handlebars как шаблонизатора
  app.engine('hbs', expressHandlebars.engine({
    extname: 'hbs',
    defaultLayout: false,
  }));
  app.setViewEngine('hbs');

  await app.listen(3000);
}
bootstrap();