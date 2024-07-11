import * as crypto from 'crypto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from 'src/users/users.service';
import { LoginDTO } from './dto/login.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { ResetCodeDTO } from './dto/verifiy-reset-code.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { Payload } from '../interfaces/payload-interface';
import { User } from '../users/entities/user.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async login(
    loginDTO: LoginDTO,
  ): Promise<{ accessToken: string } | UnauthorizedException> {
    const user = await this.findOneByEmail(loginDTO);

    if (!user || !(await bcrypt.compare(loginDTO.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload: Payload = { userId: user.id };
    return { accessToken: this.jwtService.sign(payload) };
  }

  private async findOneByEmail(userData: Partial<LoginDTO>): Promise<User> {
    return this.userService.findOneByEmail(userData);
  }

  async findOneByID(id: number): Promise<User> {
    return this.userService.findOneByID(id);
  }

  async forgotPassword(
    forgotPasswordDTO: ForgotPasswordDTO,
  ): Promise<
    { message: string } | NotFoundException | InternalServerErrorException
  > {
    const user = await this.findOneByEmail(forgotPasswordDTO);

    if (!user) {
      throw new NotFoundException(
        'No user with this email, Please double-check your email and try again.',
      );
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedResetCode = crypto
      .createHash('sha256')
      .update(resetCode)
      .digest('hex');

    user.passwordResetCode = hashedResetCode;
    user.passwordResetExpire = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetVerify = false;

    await this.userService.saveUser(user);
    try {
      await this.mailService.sendPasswordRest(user, resetCode);
    } catch (error) {
      user.passwordResetCode = null;
      user.passwordResetExpire = null;
      user.passwordResetVerify = null;
      await this.userService.saveUser(user);

      throw new InternalServerErrorException(
        'Technical difficulties. Try again later.',
      );
    }
    return { message: 'Reset code send to your email successfully' };
  }

  async verifiyResetCode(
    resetCodeDTO: ResetCodeDTO,
  ): Promise<{ message: string } | BadRequestException> {
    const resetCode = crypto
      .createHash('sha256')
      .update(resetCodeDTO.resetCode)
      .digest('hex');

    const user = await this.userService.findByResetCode(resetCode);

    if (!user) {
      throw new BadRequestException('Invalid reset code or expired.');
    }

    user.passwordResetVerify = true;
    await this.userService.saveUser(user);

    return { message: 'accepted' };
  }

  async resetPassword(
    resetPasswordDTO: ResetPasswordDTO,
  ): Promise<{ accessToken: string } | BadRequestException> {
    return this.userService.resetNewPassword(resetPasswordDTO);
  }
}
