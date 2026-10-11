import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { NutrientsUser } from './nutrients_user.model';

@Injectable()
export class NutrientsUserService {
  constructor(
    @InjectModel(NutrientsUser)
    private nutrientsUserModel: typeof NutrientsUser,
  ) {}

  async create(userData: Partial<NutrientsUser>): Promise<NutrientsUser> {
    return this.nutrientsUserModel.create(userData as any);
  }

  async findByUsername(username: string): Promise<NutrientsUser | null> {
    return this.nutrientsUserModel.findOne({ where: { username } });
  }

  async findById(id: number): Promise<NutrientsUser | null> {
    return this.nutrientsUserModel.findByPk(id);
  }
}