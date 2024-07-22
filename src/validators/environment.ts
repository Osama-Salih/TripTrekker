import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

import { plainToInstance } from 'class-transformer';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  readonly NODE_ENV: Environment;

  @IsNotEmpty()
  @IsNumber()
  readonly PORT: number;

  @IsNotEmpty()
  @IsString()
  readonly DB_HOST: string;

  @IsNotEmpty()
  @IsNumber()
  readonly DB_PORT: number;

  @IsNotEmpty()
  @IsString()
  readonly DB_USENAME: string;

  @IsNotEmpty()
  @IsString()
  readonly DB_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  readonly DB_DATABASE: string;

  @IsNotEmpty()
  @IsString()
  readonly AMADEUS_CLIENT_ID: string;

  @IsNotEmpty()
  @IsString()
  readonly AMADEUS_CLIENT_SECRET: string;

  @IsNotEmpty()
  @IsString()
  readonly JWT_SECRET: string;

  @IsNotEmpty()
  @IsString()
  readonly JWT_EXPIRE: string;

  @IsNotEmpty()
  @IsString()
  readonly MAIL_HOST: string;

  @IsNotEmpty()
  @IsNumber()
  readonly MAIL_PORT: number;

  @IsNotEmpty()
  @IsBoolean()
  readonly MAIL_SECURE: boolean;

  @IsNotEmpty()
  @IsEmail()
  readonly SERVER_EMAIL: string;

  @IsNotEmpty()
  @IsString()
  readonly MAIL_PASSWORD: string;

  @IsOptional()
  @IsEmail()
  readonly MAIL_FROM: string;

  @IsNotEmpty()
  @IsString()
  readonly STRIPE_KEY: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
