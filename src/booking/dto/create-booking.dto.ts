import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBookingDTO {
  @IsNotEmpty()
  @IsString()
  readonly bookedId: string;
}
