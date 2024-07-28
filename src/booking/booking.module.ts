import { Module, DynamicModule, Provider } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Stripe from 'stripe';

import { STRIPE_CLIENT } from './constants';
import { Booking } from './entities/booking.entity';
import { Flight } from '../flights/entities/flight.entity';
import { Hotel } from '../hotels/entities/hotel.entity';
import { Activity } from '../activities/entities/activity.entity';

@Module({})
export class BookingModule {
  static ForRoot(apiKey: string, config: Stripe.StripeConfig): DynamicModule {
    const stripe = new Stripe(apiKey, config);
    const stripeProviders: Provider = {
      provide: STRIPE_CLIENT,
      useValue: stripe,
    };
    return {
      module: BookingModule,
      imports: [TypeOrmModule.forFeature([Booking, Flight, Hotel, Activity])],
      providers: [stripeProviders, BookingService],
      controllers: [BookingController],
      exports: [stripeProviders, BookingService],
      global: true,
    };
  }
}
