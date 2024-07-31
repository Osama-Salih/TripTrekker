import {
  Injectable,
  Inject,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
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
import { processedRelations } from './interface/processed-relations-interface';
import { CheckoutSessionDTO } from './dto/checkout-sessioin.dto';
import { UserProfileService } from '../users/users-profile.service';
import { RoleEnum } from 'src/roles/role.enum';

@Injectable()
export class BookingService {
  private flight: Flight;
  private hotel: Hotel;
  private activity: Activity;
  private logger: Logger = new Logger(BookingService.name);
  private bookingsRelations: string[] = ['user', 'flight', 'activity', 'hotel'];

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
    const userPartial: Partial<User> = { email };
    const user = await this.userProfileService.findOneByEmail(userPartial);

    const newBooking = this.bookingRepo.create({
      flight: this.flight,
      hotel: this.hotel,
      activity: this.activity,
      user,
      bookingDate: new Date(),
    });

    await this.bookingRepo.save(newBooking);
  }

  async findAll(req: Request): Promise<Booking[]> {
    const { relations, userRole, userId } = await this.processedRelations(req);

    return userRole === 'admin'
      ? this.processedBookings(
          await this.bookingRepo.find({ relations }),
          userRole,
        )
      : this.bookingRepo.find({
          where: { user: { id: userId } },
          relations,
        });
  }

  async findOne(req: Request): Promise<Booking> {
    const { id: bookingId } = req.params;
    const { relations, userRole, userId } = await this.processedRelations(req);
    const booking = await this.getBookingById(
      +bookingId,
      this.bookingsRelations,
    );
    this.logger.warn(JSON.stringify(booking));
    const {
      user: { id: bookingUserId },
    } = booking;

    if (userRole !== 'admin' && userId !== bookingUserId) {
      throw new ForbiddenException(
        'You are not allowed to access this booking.',
      );
    }
    const bookingReturn = this.processedBookings(
      await this.bookingRepo.findOne({ where: { id: +bookingId }, relations }),
      userRole,
    )[0];

    return bookingReturn;
  }

  private async getAllBookingsWithRelations(
    relations: string[],
  ): Promise<Booking[]> {
    return this.bookingRepo.find({
      relations,
    });
  }

  private async getBookingById(
    bookingId: number,
    relations: string[],
  ): Promise<Booking> {
    const booking = await this.bookingRepo.findOne({
      where: { id: bookingId },
      relations,
    });
    if (!booking) {
      throw new NotFoundException(
        `There is no booking with this id ${bookingId}`,
      );
    }
    return booking;
  }

  private async processedRelations(req: Request): Promise<processedRelations> {
    const user = req.user as User;
    const { id: bookingId } = req.params;
    const { role: userRole, id: userId } = user;

    const bookings = !bookingId
      ? await this.getAllBookingsWithRelations(this.bookingsRelations)
      : await this.getBookingById(+bookingId, this.bookingsRelations);

    const processedBookings = this.processedBookings(bookings, userRole);
    const relations = this.filteredRelations(processedBookings, userRole);

    return { relations, userRole, userId };
  }

  private filteredRelations(bookings: Booking[], userRole: RoleEnum): string[] {
    const relations =
      userRole === 'admin'
        ? ['user', 'flight', 'hotel', 'activity']
        : ['flight', 'hotel', 'activity'];

    return bookings
      .map((booking) =>
        Object.keys(booking).filter((key) => relations.includes(key)),
      )
      .flat();
  }

  private processedBookings(
    bookings: Booking | Booking[],
    userRole: RoleEnum,
  ): Booking[] {
    const bookingsArray = Array.isArray(bookings) ? bookings : [bookings];

    const processedBookingArray = bookingsArray.map((booking) => {
      const filteredBooking = Object.entries(booking).reduce(
        (acc, [key, value]) => {
          if (value !== null && value !== undefined) {
            if (userRole === 'admin' && key === 'user') {
              acc[key] = value.id;
            } else if (!(userRole === 'user' && key === 'user')) {
              acc[key] = value;
            }
          }
          return acc;
        },
        {} as typeof booking,
      );
      return filteredBooking;
    });
    return processedBookingArray;
  }

  async handleWebhook(req: Request): Promise<{ message: string }> {
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        sig,
        this.configService.get<string>('WEBHOOK_SECRET'),
      );
    } catch (err) {
      return { message: `Webhook Error: ${err.message}` };
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_email;
      await this.createBooking(email);
    }

    return { message: 'received' };
  }
}
