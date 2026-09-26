import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../nutrients/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // POST /api/users/register — реально создаёт пользователя в БД.
  // В ЛР4 добавится хеширование пароля (bcrypt).
  async register(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepository.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException('Пользователь с таким логином уже существует');
    }

    const user = this.userRepository.create({
      username: dto.username,
      password: dto.password,
      role: 'создатель',
    });
    const saved = await this.userRepository.save(user);

    return { id: saved.id, username: saved.username, role: saved.role };
  }

  // POST /api/users/auth — заглушка для ЛР4.
  // Сейчас проверяет логин/пароль напрямую и возвращает данные пользователя.
  // В ЛР4 заменится на выдачу JWT/создание сессии в Redis.
  async auth(dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { username: dto.username, password: dto.password },
    });
    if (!user) {
      throw new UnauthorizedException('Неверные учётные данные');
    }
    return { id: user.id, username: user.username, role: user.role };
  }

  // POST /api/users/deauth — заглушка для ЛР4.
  // Сейчас ничего не делает (нет сессий). В ЛР4 будет удалять сессию из Redis/JWT из blacklist.
  async deauth(): Promise<void> {
    // Заглушка. В ЛР4 здесь будет очистка сессии.
  }
}