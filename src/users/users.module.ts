import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserProfileController } from './users-profile.controller';
import { UserProfileService } from './users-profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, UserProfileController],
  providers: [UsersService, UserProfileService],
  exports: [UsersService, UserProfileService],
})
export class UsersModule {}
