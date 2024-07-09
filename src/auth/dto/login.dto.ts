import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class LoginDTO {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide a valid email' })
  readonly email: string;

  @IsNotEmpty()
  @Length(6, 30, {
    message:
      'The password must be at least 6 characters but no longer then 30 characters.',
  })
  password: string;
}
