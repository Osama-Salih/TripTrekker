import { IsNotEmpty, IsString } from 'class-validator';

export class CheckoutSessionDTO {
  @IsNotEmpty()
  @IsString()
  readonly bookedId: string;
}
