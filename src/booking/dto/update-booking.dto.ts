import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDTO } from './checkout-sessioin.dto';

export class UpdateBookingDTO extends PartialType(CreateBookingDTO) {}
