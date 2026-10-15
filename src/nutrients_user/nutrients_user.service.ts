import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NutrientsUser } from './nutrients_user.entity';

@Injectable()
export class NutrientsUserService {
  constructor(
    @InjectRepository(NutrientsUser)
    private nutrientsUserRepository: Repository<NutrientsUser>,
  ) {}

  async create(userData: Partial<NutrientsUser>): Promise<NutrientsUser> {
    const user = this.nutrientsUserRepository.create(userData);
    return this.nutrientsUserRepository.save(user);
  }

  async findByUsername(username: string): Promise<NutrientsUser | null> {
    return this.nutrientsUserRepository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<NutrientsUser | null> {
    return this.nutrientsUserRepository.findOne({ where: { id } });
  }
}