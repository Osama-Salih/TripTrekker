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

import { IsUnique } from '../../validators/unique-validator';
import { IsPhoneNumber } from '../../validators/phone-validator';
import { Match } from '../../validators/match-validator';

export class CreateUserDTO {
  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  @Length(1, 200)
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
  @IsString()
  @Length(6, 30, {
    message:
      'The password must be at least 6 characters but no longer then 30 characters.',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @Match('password', { message: 'Passwords do not match' })
  passwordConfirm: string;

  @IsNotEmpty()
  @IsNumberString()
  @IsPhoneNumber({ message: 'Invalid phone number.' })
  readonly phone: string;

  @IsOptional()
  @IsString()
  @IsIn(['male', 'female'], { message: 'Gender must be male or female' })
  readonly gender: string;
}
