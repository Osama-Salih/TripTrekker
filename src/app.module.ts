import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { FlightsModule } from './flights/flights.module';
import { UsersModule } from './users/users.module';
import {
  IsUniqueConstraint,
  IsPhoneNumberConstraint,
} from './validators/custom-validator';

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
  ],
  controllers: [AppController],
  providers: [IsUniqueConstraint, IsPhoneNumberConstraint],
})
export class AppModule {
  private readonly logger: Logger = new Logger(AppModule.name);
  constructor(private dataSource: DataSource) {
    this.logger.log(
      `DATABASE CONNECTED NAME ${this.dataSource.driver.database}⚡⚡⚡`,
    );
  }
}
