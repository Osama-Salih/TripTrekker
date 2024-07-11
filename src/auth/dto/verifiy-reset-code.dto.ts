import { IsNotEmpty, IsNumberString, Length } from 'class-validator';

export class ResetCodeDTO {
  @IsNotEmpty()
  @IsNumberString()
  @Length(6, 6, { message: 'Reset code must be 6 digits.' })
  readonly resetCode: string;
}
