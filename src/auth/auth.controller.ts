import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';

import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

import { CreateUserDto } from 'src/users/dto/create-user.dto';
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

  @Post('forgot_password')
  @HttpCode(HttpStatus.ACCEPTED)
  async forgotPassword(
    @Body() forgotPasswordDTO: ForgotPasswordDTO,
  ): Promise<
    { message: string } | NotFoundException | InternalServerErrorException
  > {
    return this.authService.forgotPassword(forgotPasswordDTO);
  }

  @Post('verifiy-reset-code')
  @HttpCode(HttpStatus.ACCEPTED)
  async verifiyResetCode(
    @Body() resetCodeDTO: ResetCodeDTO,
  ): Promise<{ message: string } | BadRequestException> {
    return this.authService.verifiyResetCode(resetCodeDTO);
  }

  @Patch('reset-password')
  async resetPassword(
    @Body() resetPasswordDTO: ResetPasswordDTO,
  ): Promise<{ accessToken: string } | BadRequestException> {
    return this.authService.resetPassword(resetPasswordDTO);
  }
}
