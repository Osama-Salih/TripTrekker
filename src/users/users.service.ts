import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
}
