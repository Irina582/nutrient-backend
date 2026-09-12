import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutrientsController } from './nutrients.controller';
import { NutrientsService } from './nutrients.service';
import { Nutrient } from '../entities/nutrient.entity';
import { Like } from '../entities/like.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nutrient, Like, User])],
  controllers: [NutrientsController],
  providers: [NutrientsService],
})
export class NutrientsModule {}