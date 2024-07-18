import { Module, DynamicModule, Provider } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';

import Stripe from 'stripe';
import { STRIPE_CLIENT } from './constants';

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
      providers: [stripeProviders, BookingService],
      controllers: [BookingController],
      exports: [stripeProviders],
      global: true,
    };
  }
}
