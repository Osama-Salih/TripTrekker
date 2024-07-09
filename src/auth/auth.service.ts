import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from 'src/users/users.service';
import { LoginDTO } from './dto/login.dto';
import { Payload } from '../interfaces/payload-interface';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
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

  private async findOneByEmail(userData: LoginDTO): Promise<User> {
    return this.userService.findOneByEmail(userData);
  }

  async findOneByID(id: number): Promise<User> {
    return this.userService.findOneByID(id);
  }
}
