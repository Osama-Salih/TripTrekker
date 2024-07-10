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
import { Payload } from '../interfaces/payload-interface';

@Injectable()
export class AccountStatusMiddleware implements NestMiddleware {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    if (req.url === '/reactive-me') next();

    const authHeader = req.headers.authorization;
    if (!authHeader && !authHeader.startsWith('Bearer')) {
      throw new UnauthorizedException('No authorization token found');
    }
    const token = authHeader.split(' ')[1];
    const { userId }: Partial<Payload> = this.jwtService.verify(
      token,
      this.configService.get('JWT_SECRET'),
    );

    const user = await this.entityManager
      .getRepository(User)
      .createQueryBuilder('user')
      .where(`user.id = :userId`, { userId })
      .getOne();

    if (!user.isActive)
      throw new ForbiddenException('Your account is deactivated');

    next();
  }
}
