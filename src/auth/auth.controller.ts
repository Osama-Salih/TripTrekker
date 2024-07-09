import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';

import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDTO } from './dto/login.dto';
import { ResponseCreateUserDTO } from 'src/users/dto/create-user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}
  @Post('signup')
  async signup(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ResponseCreateUserDTO> {
    return this.userService.create(createUserDto);
  }

  @Post('login')
  async login(
    @Body() loginDTO: LoginDTO,
  ): Promise<{ accessToken: string } | UnauthorizedException> {
    return this.authService.login(loginDTO);
  }
}
