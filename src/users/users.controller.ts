import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRoleEnum } from './entities/user.role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserInternalDto } from './dto/create-user-internal.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { GetUser, UserPayload } from 'src/auth/decorators/get-user.decorator';
import { UpdateUserInternalDto } from 'src/users/dto/update-user-internal.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar novo usuário (Público)',
    description: 'Cria um usuário padrão (CLIENT)',
  })
  @Public()
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos ou já existentes' })
  registerPublic(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.CLIENT, UserRoleEnum.ADMIN, UserRoleEnum.SELLER)
  @ApiBearerAuth('access-token')
  @Get('me')
  getMyProfile(@GetUser() user: UserPayload) {
    return this.usersService.findOne(user.userId);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.CLIENT, UserRoleEnum.ADMIN, UserRoleEnum.SELLER) // Todos logados podem
  @ApiBearerAuth('access-token')
  @Patch('me') // Removi o :id da URL, pegamos do token para segurança
  @ApiOperation({
    summary: 'Atualizar meu perfil',
    description: 'Atualiza os dados do próprio perfil',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso' })
  updateMe(@GetUser() user: UserPayload, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(user.userId, updateUserDto);
  }

  // --- ROTAS ADMIN (Gerenciamento) ---

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth('access-token')
  @Post()
  @ApiOperation({
    summary: 'Criar usuário (Admin)',
    description: 'Cria um usuário com permissão de definir Roles',
  })
  @ApiBody({ type: CreateUserInternalDto })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  createInternalUser(@Body() createUserDto: CreateUserInternalDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth('access-token')
  @Get()
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description: 'Apenas admin',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth('access-token')
  @Get(':id')
  @ApiOperation({
    summary: 'Buscar usuário por ID',
    description: 'Apenas admin',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth('access-token')
  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar qualquer usuário',
    description: 'Admin pode alterar dados e roles',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserInternalDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @ApiOperation({ summary: 'Deletar usuário', description: 'Apenas admin' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
