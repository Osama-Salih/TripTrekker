import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = User>(err: any, user: any): TUser {
    if (err || !user)
      throw new UnauthorizedException(
        'You are not logged in, Please login to access this resource.',
      );
    return user;
  }
}
