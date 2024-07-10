import { IsNotEmpty, Length } from 'class-validator';

export class PasswordToChange {
  @IsNotEmpty()
  @Length(6, 30, {
    message:
      'The password must be at least 6 characters but no longer then 30 characters.',
  })
  password: string;
}
