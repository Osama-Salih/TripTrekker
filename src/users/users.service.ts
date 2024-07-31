import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';
import * as bcrypt from 'bcryptjs';

import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { PasswordToChangeDTO } from './dto/change-password.dto';

import { ResponseCreateUserDTO } from './dto/create-user-response.dto';
import { ResponseGetUsersDTO } from './dto/get-users-response.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(userDto: CreateUserDTO): Promise<ResponseCreateUserDTO> {
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

  async update(id: number, updateUserDTO: UpdateUserDTO): Promise<User> {
    const { firstName, lastName, username, email, phone } = updateUserDTO;

    await this.userRepo.update(id, {
      firstName,
      lastName,
      username,
      email,
      phone,
    });

    return this.findOneByID(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOneByID(id);
    await this.userRepo.remove(user);
  }

  async changeUserPassword(
    id: number,
    data: PasswordToChangeDTO,
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
}
