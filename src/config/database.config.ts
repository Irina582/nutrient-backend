import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Nutrient } from '../entities/nutrient.entity';
import { Like } from '../entities/like.entity';

export const databaseConfig = (): TypeOrmModuleOptions => {
  const host = process.env.DB_HOST ?? 'localhost';
  const port = Number(process.env.DB_PORT ?? 5432);
  const user = process.env.DB_USER ?? 'postgres';
  const password = process.env.DB_PASS ?? '';
  const name = process.env.DB_NAME ?? 'nutrients_db';

  // Отладка: покажет в консоли, что реально прочиталось
  console.log('DB config:', {
    host,
    port,
    user,
    name,
    passwordLength: password.length,
    passwordType: typeof password,
  });

  return {
    type: 'postgres',
    host,
    port,
    username: user,
    password,
    database: name,
    entities: [User, Nutrient, Like],
    synchronize: false,
    logging: true,
  };
};