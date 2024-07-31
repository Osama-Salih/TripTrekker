import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  Logger,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

import { DataSource } from 'typeorm';
import { AppController } from './app.controller';

import { FlightsModule } from './flights/flights.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HotelsModule } from './hotels/hotels.module';

import { ActivitiesModule } from './activities/activities.module';
import { BookingModule } from './booking/booking.module';
import { MailModule } from './mail/mail.module';

import { UserProfileController } from './users/users-profile.controller';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';

import { IsPhoneNumberConstraint } from './validators/phone-validator';
import { validate } from './validators/environment';
import { IsUniqueConstraint } from './validators/unique-validator';

import { typeOrmAsyncConfig } from './db/data-source';
import configration from './config/configration';
import redisOptions from './config/redis-options';

import { AccountStatusMiddleware } from './middlewares/account-status-middleware';

@Module({
  imports: [
    CacheModule.registerAsync(redisOptions),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),

    ConfigModule.forRoot({
      envFilePath: [`${process.cwd()}/.env.${process.env.NODE_ENV}`],
      isGlobal: true,
      load: [configration],
      validate: validate,
    }),

    FlightsModule,
    UsersModule,
    AuthModule,

    MailModule,
    HotelsModule,
    ActivitiesModule,

    BookingModule.ForRoot(process.env.STRIPE_KEY, { apiVersion: '2024-06-20' }),
  ],
  controllers: [AppController],
  providers: [
    IsUniqueConstraint,
    IsPhoneNumberConstraint,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  private readonly logger: Logger = new Logger(AppModule.name);
  constructor(private dataSource: DataSource) {
    this.logger.log(
      `DATABASE CONNECTED NAME ${this.dataSource.driver.database}⚡⚡⚡`,
    );
  }
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AccountStatusMiddleware)
      .exclude(
        { path: 'users/reactive-me', method: RequestMethod.PATCH },
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/signup', method: RequestMethod.POST },
        { path: 'auth/forgot_password', method: RequestMethod.POST },
        { path: 'auth/verifiy-reset-code', method: RequestMethod.POST },
        { path: 'auth/reset-password', method: RequestMethod.PATCH },
      )
      .forRoutes(UsersController, UserProfileController, AuthController);
  }
}
