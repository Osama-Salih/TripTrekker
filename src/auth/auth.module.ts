import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './jwt.strategy';
import jwtOptions from 'src/config/jwt-options';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync(jwtOptions),
    PassportModule,
    MailModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
