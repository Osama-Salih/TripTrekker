import { Body, Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { Request } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles/role.guard';
import { Roles } from '../roles/role.decorator';
import { RoleEnum } from '../roles/role.enum';

import { CheckoutSessionDTO } from './dto/checkout-sessioin.dto';
import { Booking } from './entities/booking.entity';
import { User } from '../users/entities/user.entity';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('checkout')
  @Roles(RoleEnum.USER)
  async checkoutSession(
    @Req() req: Request,
    @Body() checkoutSessionDTO: CheckoutSessionDTO,
  ) {
    return this.bookingService.checkoutSession(req, checkoutSessionDTO);
  }

  @Get()
  @Roles(RoleEnum.USER, RoleEnum.ADMIN)
  async findAll(@Req() req: Request): Promise<Booking[]> {
    const user = req.user as User;
    return this.bookingService.findAll(user);
  }
}
