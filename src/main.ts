import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as expressHandlebars from 'express-handlebars';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Статика: /style.css, /defaults/*, /media/*
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Папка с шаблонами
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  // Handlebars с хелперами для дефолтных медиа
  app.engine(
    'hbs',
    expressHandlebars.engine({
      extname: 'hbs',
      defaultLayout: false,
      partialsDir: join(__dirname, '..', 'views', 'partials'),
      helpers: {
        // Если imageUrl пустой — подставляем дефолтную картинку
        defaultImage: (url: string) => {
          return url && url.trim() !== ''
            ? `/media/${url}`
            : '/defaults/default-image.jpg';
        },
        // Если videoUrl пустой — подставляем дефолтное видео
        defaultVideo: (url: string) => {
          return url && url.trim() !== ''
            ? `/media/${url}`
            : '/defaults/default-video.mp4';
        },
      },
    }),
  );
  app.setViewEngine('hbs');

  await app.listen(3000);
}
bootstrap();