import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';

import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

import { CreateUserDTO } from 'src/users/dto/create-user.dto';
import { LoginDTO } from './dto/login.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';

import { ResetCodeDTO } from './dto/verifiy-reset-code.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { ResponseCreateUserDTO } from 'src/users/dto/create-user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}
  @Post('signup')
  async signup(
    @Body() createUserDTO: CreateUserDTO,
  ): Promise<ResponseCreateUserDTO> {
    return this.userService.create(createUserDTO);
  }

  @Post('login')
  async login(@Body() loginDTO: LoginDTO): Promise<{ accessToken: string }> {
    return this.authService.login(loginDTO);
  }

  @Post('forgot_password')
  @HttpCode(HttpStatus.ACCEPTED)
  async forgotPassword(
    @Body() forgotPasswordDTO: ForgotPasswordDTO,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(forgotPasswordDTO);
  }

  @Post('verifiy-reset-code')
  @HttpCode(HttpStatus.ACCEPTED)
  async verifiyResetCode(
    @Body() resetCodeDTO: ResetCodeDTO,
  ): Promise<{ message: string }> {
    return this.authService.verifiyResetCode(resetCodeDTO);
  }

  @Patch('reset-password')
  async resetPassword(
    @Body() resetPasswordDTO: ResetPasswordDTO,
  ): Promise<{ accessToken: string }> {
    return this.authService.resetPassword(resetPasswordDTO);
  }
}
