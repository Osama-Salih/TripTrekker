import {
  IsAlpha,
  IsNotEmpty,
  IsString,
  Length,
  IsNumberString,
  IsEmail,
  IsOptional,
  IsIn,
} from 'class-validator';

import { IsUnique, IsPhoneNumber } from '../../validators/custom-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  @Length(1, 200)
  @IsUnique({ tableName: 'users', column: 'firstName' })
  readonly firstName: string;

  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  @Length(1, 200)
  readonly lastName: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 50, {
    message: 'username must be between 3 to 50 characters long.',
  })
  @IsUnique({ tableName: 'users', column: 'username' })
  readonly username: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsUnique({ tableName: 'users', column: 'email' })
  readonly email: string;

  @IsNotEmpty()
  @Length(6, 30, {
    message:
      'The password must be at least 6 characters but no longer then 30 characters.',
  })
  password: string;

  @IsNotEmpty()
  @IsNumberString()
  @IsPhoneNumber({ message: 'Invalid phone number.' })
  readonly phone: string;

  @IsOptional()
  @IsString()
  @IsIn(['male', 'female'], { message: 'Gender must be male or female' })
  readonly gender: string;
}
