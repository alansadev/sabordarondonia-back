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
import { ObjectId } from 'mongodb';
import { UserRoleEnum } from './entities/user.role';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      let password_hash;
      const userData = {
        name: createUserDto.name,
        phone: createUserDto.phone,
        roles: createUserDto.roles,
        is_admin: createUserDto.isAdmin ?? false,
      };

      if (createUserDto.password) {
        const salt = 10;
        password_hash = await bcrypt.hash(createUserDto.password, salt);
        Object.assign(userData, password_hash);
      }

      const newUser = this.userRepository.create(userData);

      return this.userRepository.save(newUser);
    } catch (error) {
      // Forma segura de verificar a propriedade
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 11000
      ) {
        throw new ConflictException('This phone is already registered');
      }
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['orders'],
    });
  }

  async findOne(id: string): Promise<User> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Formato de ID inválido: ${id}`);
    }

    const user = await this.userRepository.findOneBy({
      _id: new ObjectId(id),
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    console.log(user);
    return user;
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phone },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Formato de ID inválido: ${id}`);
    }

    const objectId = new ObjectId(id);

    const user = await this.userRepository.findOne({
      where: { _id: objectId },
    });

    if (updateUserDto.phone) {
      const userByPhone = await this.findByPhone(updateUserDto.phone);
      if (userByPhone)
        throw new ConflictException('O telefone informado já está cadastrado');
    }

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    const { password, isAdmin, roles, ...restOfDto } = updateUserDto;
    Object.assign(user, restOfDto);

    if (password) {
      const salt = 10;
      user.password_hash = await bcrypt.hash(password, salt);
    }

    if (roles) {
      const existingRoles = user.roles || [];
      const rolesSet = new Set(existingRoles);

      for (const role of roles) {
        rolesSet.add(role);
      }

      user.roles = Array.from(rolesSet);
    }

    if (isAdmin && !user.is_admin) {
      user.roles.push(UserRoleEnum.ADMIN);
      user.is_admin = isAdmin;
    }

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Formato de ID inválido: ${id}`);
    }
    const result = await this.userRepository.delete(new ObjectId(id));
    if (result.affected === 0) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
  }
}
