import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Match } from '../../validators/match-validator';

export class PasswordToChangeDTO {
  @IsNotEmpty()
  @IsString()
  @Length(6, 30, {
    message:
      'The password must be at least 6 characters but no longer then 30 characters.',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @Match('password', { message: 'Passwords do not match' })
  passwordConfirm: string;
}
