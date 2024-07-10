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
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles/role.guard';
import { Roles } from '../roles/role.decorator';
import { RoleEnum } from '../roles/role.enum';

import { ResponseGetUsersDTO } from './dto/get-users-response.dto';
import { ResponseCreateUserDTO } from './dto/create-user-response.dto';
import { PasswordToChange } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ResponseCreateUserDTO> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(RoleEnum.ADMIN)
  async findAll(): Promise<ResponseGetUsersDTO[]> {
    return this.usersService.findAll();
  }

  @Get('get-me')
  @Roles(RoleEnum.USER)
  getLoggedUserData(@Req() req: Request): ResponseGetUsersDTO {
    const user = req.user as User;
    return user;
  }

  @Patch('update-me')
  @Roles(RoleEnum.USER)
  async updateLoggedUserDate(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = req.user as User;
    return this.usersService.update(user.id, updateUserDto);
  }

  @Patch('delete-me')
  @Roles(RoleEnum.USER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateLoggedUser(@Req() req: Request): Promise<void> {
    const user = req.user as User;
    return this.usersService.deactivateLoggedUser(user.id);
  }

  @Patch('reactive-me')
  async reactivateLoggedUser(@Req() req: Request): Promise<string> {
    const user = req.user as User;
    return this.usersService.reactivateLoggedUser(user.id);
  }

  @Patch('update-my-password')
  @Roles(RoleEnum.USER)
  async updateLoggedUserPassword(
    @Req() req: Request,
    @Body() password: PasswordToChange,
  ): Promise<{ accessToken: string }> {
    const user = req.user as User;
    return this.usersService.updateLoggedUserPassword(user.id, password);
  }

  @Get(':id')
  @Roles(RoleEnum.ADMIN)
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseGetUsersDTO> {
    return this.usersService.findOneByID(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(RoleEnum.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.remove(id);
  }

  @Patch('change-user-password/:id')
  @Roles(RoleEnum.ADMIN)
  async changeUserPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() password: PasswordToChange,
  ): Promise<string> {
    return this.usersService.changeUserPassword(id, password);
  }
}
