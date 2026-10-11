import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Nutrients } from './nutrients.model';
import { NutrientsLike } from './nutrients_like.model';
import { NutrientsService } from './nutrients.service';
import { NutrientsController } from './nutrients.controller';
import { NutrientsMinioService } from './nutrients_minio.service';
import { AuthModule } from '../auth/auth.module';
import { NutrientsUserModule } from '../nutrients_user/nutrients_user.module'; 

@Module({
  imports: [
    SequelizeModule.forFeature([Nutrients, NutrientsLike]),
    AuthModule,
     NutrientsUserModule,
  ],
  providers: [NutrientsService, NutrientsMinioService],
  controllers: [NutrientsController],
  exports: [NutrientsService],
})
export class NutrientsModule {}