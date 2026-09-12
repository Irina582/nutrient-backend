import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NutrientsModule } from './nutrients/nutrients.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    // 1. Сначала ConfigModule загружает .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 2. Теперь TypeORM получает уже загруженные переменные
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    NutrientsModule,
  ],
})
export class AppModule {}