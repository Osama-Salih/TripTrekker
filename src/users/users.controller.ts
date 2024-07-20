import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles/role.guard';
import { Roles } from '../roles/role.decorator';
import { RoleEnum } from '../roles/role.enum';

import { ResponseGetUsersDTO } from './dto/get-users-response.dto';
import { ResponseCreateUserDTO } from './dto/create-user-response.dto';
import { PasswordToChangeDTO } from './dto/change-password.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body() createUserDTO: CreateUserDTO,
  ): Promise<ResponseCreateUserDTO> {
    return this.usersService.create(createUserDTO);
  }

  @Get()
  async findAll(): Promise<ResponseGetUsersDTO[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseGetUsersDTO> {
    return this.usersService.findOneByID(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDTO: UpdateUserDTO,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDTO);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.remove(id);
  }

  @Patch('change-user-password/:id')
  async changeUserPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() password: PasswordToChangeDTO,
  ): Promise<string> {
    return this.usersService.changeUserPassword(id, password);
  }
}
