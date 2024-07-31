import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from 'typeorm';

import { User } from '../users/entities/user.entity';

@Injectable()
export class AccountStatusMiddleware implements NestMiddleware {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    if (req.url === '/api/v1/profile/reactive-me') {
      next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      throw new UnauthorizedException('No authorization token found');
    }
    const token = authHeader.split(' ')[1];
    const decoded = this.jwtService.verify(
      token,
      this.configService.get('JWT_SECRET'),
    );

    const id = decoded.userId;
    const user = await this.entityManager
      .getRepository(User)
      .createQueryBuilder('user')
      .where(`user.id = :id`, { id })
      .getOne();

    if (!user.isActive) {
      throw new ForbiddenException('Your account is deactivated');
    }

    if (user.passwordChangedAt) {
      const passwordChangedTimestamp = parseInt(
        (user.passwordChangedAt.getTime() / 1000).toString(),
        10,
      );

      if (passwordChangedTimestamp > decoded.iat) {
        new ForbiddenException(
          'User recently changed his password, please login again',
        );
      }
    }
    next();
  }
}
