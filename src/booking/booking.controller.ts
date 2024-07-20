import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { Request } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles/role.guard';
import { Roles } from '../roles/role.decorator';
import { RoleEnum } from '../roles/role.enum';

import { CreateBookingDTO } from './dto/create-booking.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @Roles(RoleEnum.USER)
  async createBooking(
    @Req() req: Request,
    @Body() createBookingDTO: CreateBookingDTO,
  ) {
    return this.bookingService.createBooking(req, createBookingDTO);
  }
}
