import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PasswordToChange } from './dto/change-password.dto';
import { ResetPasswordDTO } from '../auth/dto/reset-password.dto';
import { User } from './entities/user.entity';
import { ResponseCreateUserDTO } from './dto/create-user-response.dto';
import { ResponseGetUsersDTO } from './dto/get-users-response.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(userDto: CreateUserDto): Promise<ResponseCreateUserDTO> {
    const user = this.userRepo.create({
      ...userDto,
      password: await bcrypt.hash(userDto.password, 12),
    });

    await this.userRepo.save(user);

    const token = this.jwtService.sign({ userId: user.id });
    return new ResponseCreateUserDTO(user, token);
  }

  async findAll(): Promise<ResponseGetUsersDTO[]> {
    const users = await this.userRepo.find();
    return users.map((user) =>
      plainToClass(ResponseGetUsersDTO, user, {
        excludeExtraneousValues: true,
      }),
    );
  }

  async findOneByID(id: number): Promise<ResponseGetUsersDTO> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`There is no user with id: ${id}`);
    }
    return new ResponseGetUsersDTO(user);
  }

  async findOneByEmail(userData: Partial<User>): Promise<User> {
    return this.userRepo.findOneBy({ email: userData.email });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepo.update(id, {
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      username: updateUserDto.username,
      email: updateUserDto.email,
    });

    return this.findOneByID(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOneByID(id);
    await this.userRepo.remove(user);
  }

  async saveUser(user: User): Promise<void> {
    await this.userRepo.save(user);
  }

  async changeUserPassword(
    id: number,
    data: PasswordToChange,
  ): Promise<string> {
    const user = await this.findOneByID(id);

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Incorrect current password.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    await this.userRepo.update(id, {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    });
    return 'Password changed successfully.';
  }

  async updateLoggedUserDate(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    await this.userRepo.update(id, {
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      username: updateUserDto.username,
      email: updateUserDto.email,
      phone: updateUserDto.phone,
      gender: updateUserDto.gender,
    });

    return this.findOneByID(id);
  }

  async deactivateLoggedUser(id: number): Promise<void> {
    await this.userRepo.update(id, {
      isActive: false,
    });
  }
  async reactivateLoggedUser(id: number): Promise<string> {
    await this.userRepo.update(id, {
      isActive: true,
    });

    return 'Account status active';
  }

  async updateLoggedUserPassword(
    id: number,
    data: PasswordToChange,
  ): Promise<{ accessToken: string }> {
    await this.changeUserPassword(id, data);
    return { accessToken: this.jwtService.sign({ userId: id }) };
  }

  async findByResetCode(resetCode: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .where('user.passwordResetCode = :resetCode', { resetCode })
      .andWhere('user.passwordResetExpire > :now', { now: new Date() })
      .getOne();
  }

  async resetNewPassword(
    resetPasswordDTO: ResetPasswordDTO,
  ): Promise<{ accessToken: string } | BadRequestException> {
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
