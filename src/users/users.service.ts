import * as bcrypt from 'bcrypt';

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserRoleEnum } from './entities/user.role.enum';
import { FindOrCreateUserDto } from './dto/find-or-create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findOrCreateByPhone(
    findOrCreateUserDto: FindOrCreateUserDto,
  ): Promise<User> {
    const { phone, name } = findOrCreateUserDto;

    const existingUser = await this.findByPhone(phone);

    if (existingUser) {
      return existingUser;
    }

    const newUser = await this.create({
      name,
      phone,
      roles: [UserRoleEnum.CLIENT],
    });

    return newUser;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, password_hash, ...restOfDto } = createUserDto;
    const userData: Partial<User> = { ...restOfDto };

    try {
      if (password) {
        const salt = await bcrypt.genSalt();
        userData.password_hash = await bcrypt.hash(password, salt);
      } else if (password_hash) {
        userData.password_hash = password_hash;
      }

      const newUser = this.userRepository.create(userData);
      return this.userRepository.save(newUser);
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
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.roles',
        'user.password_hash',
      ])
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

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
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
}
