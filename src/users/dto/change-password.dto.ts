import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Match } from 'src/validators/custom-validator';

export class PasswordToChange {
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
