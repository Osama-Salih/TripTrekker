import { Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';

import { BookingService } from './booking/booking.service';

@Controller()
export class AppController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  getHello(): string {
    return 'TripTrekker api service status: 🟢';
  }

  @Post('webhook-checkout')
  async checkout(@Req() req: Request) {
    return this.bookingService.checkout(req);
  }
}
