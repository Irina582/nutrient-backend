import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as expressHandlebars from 'express-handlebars';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Логгер входящих HTTP-запросов (для отладки и скринов на защите)
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`>>> ${req.method} ${req.url}`);
    next();
  });

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