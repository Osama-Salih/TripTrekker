import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { Repository } from 'typeorm';
import { Request } from 'express';
import Stripe from 'stripe';

import { STRIPE_CLIENT } from './constants';
import { Flight } from '../flights/entities/flight.entity';
import { Hotel } from '../hotels/entities/hotel.entity';
import { Activity } from '../activities/entities/activity.entity';
import { User } from '../users/entities/user.entity';
import { Booking } from './entities/booking.entity';

import {
  BookedService,
  BookedServiceType,
} from './interface/booked-service-interface';
import { CheckoutSessionDTO } from './dto/checkout-sessioin.dto';
import { UserProfileService } from '../users/users-profile.service';

@Injectable()
export class BookingService {
  private flight: Flight;
  private hotel: Hotel;
  private activity: Activity;
  private logger: Logger = new Logger(BookingService.name);

  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    @InjectRepository(Flight)
    private readonly flightRepo: Repository<Flight>,
    @InjectRepository(Hotel)
    private readonly hotelRepo: Repository<Hotel>,
    @InjectRepository(Activity)
    private readonly ActivityRepo: Repository<Activity>,
    private readonly userProfileService: UserProfileService,
    private readonly configService: ConfigService,
  ) {}

  private async sessionHelper(
    req: Request,
    price: number,
    currency: string,
    cancelUrl: string,
  ) {
    const user = req.user as User;
    return await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            unit_amount: price * 100,
            currency: currency.toLowerCase(),
            product_data: {
              name: user.firstName,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/api/v1/bookings`,
      cancel_url: `${req.protocol}://${req.get('host')}/api/v1/${cancelUrl}`,
      customer_email: user.email,
    });
  }

  async checkoutSession(req: Request, checkoutSessionDTO: CheckoutSessionDTO) {
    const { price, currency, cancelUrl } = await this.bookedServiceDetails(
      checkoutSessionDTO.bookedId,
    );

    const session = this.sessionHelper(req, price, currency, cancelUrl);
    return session;
  }

  private async bookedServiceDetails(
    bookedId: string,
  ): Promise<BookedServiceType> {
    const bookedService = await this.findBookedService(bookedId);

    if (!bookedService) {
      throw new NotFoundException('Unknown service ID');
    }

    const { price, currency, cancelUrl } = this.getBookedServiceDetails(
      bookedService,
      bookedId,
    );

    return { price, currency, cancelUrl };
  }

  private async findBookedService(bookedId: string): Promise<BookedService> {
    const flight = await this.flightRepo.findOneBy({ flight_number: bookedId });
    if (flight) return flight;

    const hotel = await this.hotelRepo.findOneBy({ hotelId: bookedId });
    if (hotel) return hotel;

    const activity = await this.ActivityRepo.findOneBy({
      activityId: bookedId,
    });
    if (activity) return activity;

    return null;
  }

  private getBookedServiceDetails(
    service: BookedService,
    bookedId: string,
  ): BookedServiceType {
    let price: number;
    let currency: string;
    let cancelUrl: string;

    if ('flight_number' in service) {
      currency = service.currency_code;
      price = service.price;
      cancelUrl = `flights/${bookedId}`;
      this.flight = service;
    } else if ('hotelId' in service) {
      currency = service.currency;
      price = service.price;
      cancelUrl = `hotels/${bookedId}`;
      this.hotel = service;
    } else if ('activityId' in service) {
      currency = service.currency;
      price = service.price;
      cancelUrl = `activities/${bookedId}`;
      this.activity = service;
    }

    return { currency, price, cancelUrl };
  }

  private async createBooking(email: string): Promise<void> {
    this.logger.warn(`Email from create booking method: ${email} ⚡⚡⚡`);

    const userPartial: Partial<User> = { email };

    const user = await this.userProfileService.findOneByEmail(userPartial);

    this.logger.warn(`User: ${JSON.stringify(user)} ⚡⚡⚡`);

    const newBooking = this.bookingRepo.create({
      flight: this.flight,
      hotel: this.hotel,
      activity: this.activity,
      user,
      bookingDate: new Date(),
    });

    this.logger.warn(`New Booking: ${JSON.stringify(newBooking)} ⚡⚡⚡`);
    await this.bookingRepo.save(newBooking).catch((err) => {
      this.logger.error(`Failed to save booking: ${err.message}`);
    });
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepo.find();
  }

  async handleWebhook(req: Request): Promise<{ message: string }> {
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;

    this.logger.log('Before construct event⚡⚡⚡');

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        sig,
        this.configService.get<string>('WEBHOOK_SECRET'),
      );
      this.logger.warn(`req.body: ${JSON.stringify(req.body)}`);
    } catch (err) {
      return { message: `Webhook Error: ${err.message}` };
    }
    this.logger.log('After construct event⚡⚡⚡');

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_email;
      this.logger.warn(`Email from hadle webhook method: ${email} ⚡⚡⚡`);

      await this.createBooking(email).catch((err) => {
        this.logger.error(`Failed to create booking: ${err.message} ⚡⚡⚡`);
      });
    }

    return { message: 'received' };
  }
}
