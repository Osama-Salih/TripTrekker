import { Injectable, Inject } from '@nestjs/common';
import Stripe from 'stripe';
import { STRIPE_CLIENT } from './constants';

@Injectable()
export class BookingService {
  constructor(@Inject(STRIPE_CLIENT) private readonly stripe: Stripe) {}
}
