import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nutrients } from './nutrients.entity';
import { NutrientsLike } from './nutrients_like.entity';
import { NutrientsService } from './nutrients.service';
import { NutrientsController } from './nutrients.controller';
import { NutrientsMinioService } from './nutrients_minio.service';
import { AuthModule } from '../auth/auth.module';
import { NutrientsUserModule } from '../nutrients_user/nutrients_user.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Nutrients, NutrientsLike]),
    AuthModule,
    NutrientsUserModule,
  ],
  providers: [NutrientsService, NutrientsMinioService],
  controllers: [NutrientsController],
  exports: [NutrientsService],
})
export class NutrientsModule {}