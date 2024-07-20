import { BadRequestException, Injectable } from '@nestjs/common';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';

import { PasswordToChangeDTO } from './dto/change-password.dto';
import { ResetPasswordDTO } from '../auth/dto/reset-password.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async findOneByEmail(userData: Partial<User>): Promise<User> {
    return this.userRepo.findOneBy({ email: userData.email });
  }

  async saveUser(user: User): Promise<void> {
    await this.userRepo.save(user);
  }

  async updateUserDate(
    id: number,
    updateUserDTO: UpdateUserDTO,
  ): Promise<User> {
    const { firstName, lastName, username, email, phone, gender } =
      updateUserDTO;
    await this.userRepo.update(id, {
      firstName,
      lastName,
      username,
      email,
      phone,
      gender,
    });

    return this.usersService.findOneByID(id);
  }

  async deactivateUser(id: number): Promise<void> {
    await this.userRepo.update(id, {
      isActive: false,
    });
  }

  async reactivateUser(id: number): Promise<string> {
    await this.userRepo.update(id, {
      isActive: true,
    });

    return 'Account status active';
  }

  async updateUserPassword(
    id: number,
    data: PasswordToChangeDTO,
  ): Promise<{ accessToken: string }> {
    await this.usersService.changeUserPassword(id, data);
    return { accessToken: this.jwtService.sign({ userId: id }) };
  }

  async findByResetCode(resetCode: string): Promise<User> {
    return this.userRepo
      .createQueryBuilder('user')
      .where('user.passwordResetCode = :resetCode', { resetCode })
      .andWhere('user.passwordResetExpire > :now', { now: new Date() })
      .getOne();
  }

  async resetNewPassword(
    resetPasswordDTO: ResetPasswordDTO,
  ): Promise<{ accessToken: string }> {
    const user = await this.findOneByEmail(resetPasswordDTO);

    if (user.passwordResetCode) {
      user.password = await bcrypt.hash(resetPasswordDTO.password, 12);
      user.passwordResetCode = null;
      user.passwordResetExpire = null;
      user.passwordResetVerify = null;

      await this.userRepo.save(user);
      return { accessToken: this.jwtService.sign({ userId: user.id }) };
    } else {
      throw new BadRequestException(
        'Please initiate a forgot password request first',
      );
    }
  }
}
