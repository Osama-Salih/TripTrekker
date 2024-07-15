import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { FlightsModule } from './flights/flights.module';
import { UsersModule } from './users/users.module';
import { AccountStatusMiddleware } from './middlewares/account-status-middleware';

import {
  IsUniqueConstraint,
  IsPhoneNumberConstraint,
} from './validators/custom-validator';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { MailModule } from './mail/mail.module';
import { HotelsModule } from './hotels/hotels.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USENAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    ConfigModule.forRoot({
      envFilePath: ['.env.development'],
      isGlobal: true,
    }),
    FlightsModule,
    UsersModule,
    AuthModule,
    MailModule,
    HotelsModule,
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
      .forRoutes(UsersController, AuthController);
  }
}
