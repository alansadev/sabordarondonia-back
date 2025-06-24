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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const userData = {
        name: createUserDto.name,
        phone: createUserDto.phone,
        roles: createUserDto.roles,
        password_hash: createUserDto.password,
        is_admin: createUserDto.isAdmin ?? false,
      };

      const newUser = this.userRepository.create(userData);
      const user = await this.userRepository.save(newUser);

      return user;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 11000) {
        throw new ConflictException('This phone is already registered');
      }
      throw error;
    }
  }

  async findAll() {
    return this.userRepository.find();
  }

  async findOne(id: string) {
    if (!ObjectId.isValid(id)) {
      throw new NotFoundException(`Formato de ID inválido: ${id}`);
    }

    const objectId = new ObjectId(id);

    const user = await this.userRepository.findOne({
      where: { _id: objectId },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    console.log(updateUserDto);
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    // const user = await this.userRepository.findOne({ where: { id } });

    // if (!user) throw new NotFoundException('User  not found');

    const removed = await this.userRepository.delete({ phone: id });
    return removed;
  }
}
