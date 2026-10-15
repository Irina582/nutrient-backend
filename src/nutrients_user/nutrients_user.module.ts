import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutrientsUser } from './nutrients_user.entity';
import { NutrientsUserService } from './nutrients_user.service';

@Module({
  imports: [TypeOrmModule.forFeature([NutrientsUser])],
  providers: [NutrientsUserService],
  exports: [NutrientsUserService],
})
export class NutrientsUserModule {}