import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NutrientsUser } from './nutrients_user/nutrients_user.entity';
import { Nutrients } from './nutrients/nutrients.entity';
import { NutrientsLike } from './nutrients/nutrients_like.entity';
import { NutrientsUserModule } from './nutrients_user/nutrients_user.module';
import { AuthModule } from './auth/auth.module';
import { NutrientsModule } from './nutrients/nutrients.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: parseInt(config.get('DB_PORT', '5434'), 10),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_DATABASE'),
        entities: [NutrientsUser, Nutrients, NutrientsLike],
        synchronize: false, 
      }),
    }),
    NutrientsUserModule,
    AuthModule,
    NutrientsModule,
    SessionModule,
  ],
})
export class AppModule {}