import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as expressHandlebars from 'express-handlebars';

const MINIO_URL = 'http://localhost:9000/media';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Статика: /style.css
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Папка с шаблонами
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  // Handlebars с хелперами для медиа из MinIO
  app.engine(
    'hbs',
    expressHandlebars.engine({
      extname: 'hbs',
      defaultLayout: false,
      partialsDir: join(__dirname, '..', 'views', 'partials'),
      helpers: {
        // Если imageUrl пустой — берём default-image.jpg из MinIO
        defaultImage: (key: string) => {
          const file = key && key.trim() !== '' ? key : 'default-image.jpg';
          return `${MINIO_URL}/${file}`;
        },
        // Если videoUrl пустой — берём default-video.mp4 из MinIO
        defaultVideo: (key: string) => {
          const file = key && key.trim() !== '' ? key : 'default-video.mp4';
          return `${MINIO_URL}/${file}`;
        },
      },
    }),
  );
  app.setViewEngine('hbs');

  await app.listen(3000);
}
bootstrap();