import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { UsersService } from './users.service';
import { UserProfileService } from './users-profile.service';
import { User } from './entities/user.entity';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles/role.guard';
import { Roles } from '../roles/role.decorator';
import { RoleEnum } from '../roles/role.enum';

import { ResponseGetUsersDTO } from './dto/get-users-response.dto';
import { PasswordToChangeDTO } from './dto/change-password.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

@Controller('profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleEnum.USER)
export class UserProfileController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userProfileService: UserProfileService,
  ) {}

  @Get('me')
  getUserData(@Req() req: Request): ResponseGetUsersDTO {
    const user = req.user as User;
    return user;
  }

  @Patch('update-me')
  async updateUserDate(
    @Req() req: Request,
    @Body() updateUserDTO: UpdateUserDTO,
  ): Promise<User> {
    return this.usersService.update(this.extractId(req), updateUserDTO);
  }

  @Patch('delete-me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateUser(@Req() req: Request): Promise<void> {
    return this.userProfileService.deactivateUser(this.extractId(req));
  }

  @Patch('reactive-me')
  async reactivateUser(@Req() req: Request): Promise<string> {
    return this.userProfileService.reactivateUser(this.extractId(req));
  }

  @Patch('update-my-password')
  async updateUserPassword(
    @Req() req: Request,
    @Body() password: PasswordToChangeDTO,
  ): Promise<{ accessToken: string }> {
    return this.userProfileService.updateUserPassword(
      this.extractId(req),
      password,
    );
  }

  private extractId(req: Request): number {
    const { id } = this.getUserData(req);
    return id;
  }
}
