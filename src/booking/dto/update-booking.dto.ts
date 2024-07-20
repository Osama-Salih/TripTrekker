import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDTO } from './create-booking.dto';

export class UpdateBookingDTO extends PartialType(CreateBookingDTO) {}
