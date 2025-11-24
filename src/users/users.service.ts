import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRoleEnum } from './entities/user.role.enum';
import { AppLogger } from 'src/common/logger/logger.service';

import { CreateUserInternalDto } from './dto/create-user-internal.dto';
import { UpdateUserInternalDto } from './dto/update-user-internal.dto';
import { FindOrCreateUserDto } from './dto/find-or-create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly logger: AppLogger,
  ) {}

  async findOrCreateByPhone(
    findOrCreateUserDto: FindOrCreateUserDto,
  ): Promise<User> {
    const { phone, name } = findOrCreateUserDto;

    const existingUser = await this.findByPhone(phone);

    if (existingUser) {
      return existingUser;
    }

    const newUser = this.userRepository.create({
      name,
      phone,
      roles: [UserRoleEnum.CLIENT],
    });

    return this.userRepository.save(newUser);
  }

  async create(createUserDto: CreateUserInternalDto): Promise<User> {
    const { password, roles, ...restOfDto } = createUserDto;

    const userData: Partial<User> = { ...restOfDto };

    userData.roles = roles && roles.length > 0 ? roles : [UserRoleEnum.CLIENT];

    try {
      if (password) {
        const salt = await bcrypt.genSalt();
        userData.password_hash = await bcrypt.hash(password, salt);
      }
      this.logger.debug(`Creating user with data: ${JSON.stringify(userData)}`);
      const newUser = this.userRepository.create(userData);
      return await this.userRepository.save(newUser);
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException('Telefone ou email já registrado.');
      }
      throw error;
    }
  }

  async findForAuth(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return user;
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOneBy({ phone });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserInternalDto,
  ): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.phone) {
      const userByPhone = await this.findByPhone(updateUserDto.phone);
      if (userByPhone && userByPhone.id !== id) {
        throw new ConflictException('O telefone informado já está cadastrado');
      }
    }

    const { password, roles, ...restOfDto } = updateUserDto;

    Object.assign(user, restOfDto);

    if (password) {
      const salt = await bcrypt.genSalt();
      user.password_hash = await bcrypt.hash(password, salt);
    }

    if (roles) {
      user.roles = roles;
    }

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
  }

  async updateRefreshToken(userId: string, refreshTokenHash: string | null) {
    await this.userRepository.update(userId, {
      current_refresh_token: refreshTokenHash,
    });
  }
}
