import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { NutrientsUser } from './nutrients_user/nutrients_user.model';
import { Nutrients } from './nutrients/nutrients.model';
import { NutrientsLike } from './nutrients/nutrients_like.model';
import { NutrientsUserModule } from './nutrients_user/nutrients_user.module';
import { AuthModule } from './auth/auth.module';
import { NutrientsModule } from './nutrients/nutrients.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: parseInt(config.get('DB_PORT', '5434'), 10),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        models: [NutrientsUser, Nutrients, NutrientsLike],
        autoLoadModels: true,
        synchronize: false,   // ← ГЛАВНОЕ: БД уже есть, схему не трогаем
        define: {
          timestamps: false,  // timestamps: false
        },
      }),
    }),
    NutrientsUserModule,
    AuthModule,
    NutrientsModule,
    SessionModule,
  ],
  controllers: [AppController],
})
export class AppModule {}