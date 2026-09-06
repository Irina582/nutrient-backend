import { Module } from '@nestjs/common';
import { NutrientsModule } from './nutrients/nutrients.module';

@Module({
  imports: [NutrientsModule],
})
export class AppModule {}