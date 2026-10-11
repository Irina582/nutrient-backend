import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { NutrientsUser } from './nutrients_user.model';
import { NutrientsUserService } from './nutrients_user.service';

@Module({
  imports: [SequelizeModule.forFeature([NutrientsUser])],
  providers: [NutrientsUserService],
  exports: [NutrientsUserService],
})
export class NutrientsUserModule {}