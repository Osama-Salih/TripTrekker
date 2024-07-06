import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Amadeus from 'amadeus';

import {
  FlightOfferType,
  FlightType,
  ApiResponse,
} from '../interfaces/flights-interface';
import { GetFlightQueryDTO } from './dto/get-flights-query.dto';
import { Flight } from './entities/flight.entity';

@Injectable()
export class FlightsService {
  private amadeus: Amadeus;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Flight)
    private readonly flightRepo: Repository<FlightType>,
  ) {
    this.amadeus = new Amadeus();
  }

  async getFlights(
    getFlightQueryDTO: GetFlightQueryDTO,
  ): Promise<FlightType[] | Error> {
    try {
      const {
        origin_code,
        destination_code,
        departure_date,
        currency_code,
        return_date,
        travel_class,
        airline_code,
        non_stop,
      } = getFlightQueryDTO;

      const { data }: ApiResponse =
        await this.amadeus.shopping.flightOffersSearch.get({
          originLocationCode: origin_code,
          destinationLocationCode: destination_code,
          departureDate: departure_date,
          currencyCode: currency_code,
          return_date: return_date,
          travelClass: travel_class,
          includedAirlineCodes: airline_code,
          nonStop: non_stop,
          adults: '1',
          max: '30',
        });

      const flights = this.formatFlightsData(data);
      await this.cacheManager.set('cachedFlightsData', data, 3600000); // ttl cache for one hour

      return this.removeDuplicateFlights(flights);
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch flights');
    }
  }

  async getFlightAndConfirm(flightNumber: number): Promise<FlightType | Error> {
    const cachedFlightsData: FlightOfferType[] =
      await this.cacheManager.get('cachedFlightsData');

    // Find the flight with the given flight number
    const flight = cachedFlightsData.find(
      (flight) =>
        flight.itineraries[0]?.segments[0]?.number === flightNumber.toString(),
    );
    if (!flight) {
      throw new BadRequestException(
        `Flight with number (${flightNumber}) not found, Please send a GET flights request and chose the correct flight number.`,
      );
    }

    try {
      // Send confirmation request to amadeus api.
      const {
        result: {
          data: { flightOffers },
        },
      } = await this.amadeus.shopping.flightOffers.pricing.post(
        JSON.stringify({
          data: {
            type: 'flight-offers-pricing',
            flightOffers: [flight],
          },
        }),
      );

      const confirmedFlight = this.formatFlightsData(flightOffers)[0];
      this.saveFlight(confirmedFlight);
      return confirmedFlight;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error conforming flight offers pricing',
      );
    }
  }

  private removeDuplicateFlights = (flights: FlightType[]): FlightType[] => {
    const uniqueFlightsMap = new Map();

    flights.forEach((flight) => {
      const key = `${flight.flight_number}-${flight.departure_date}-${flight.arrival_date}`;
      if (!uniqueFlightsMap.has(key)) {
        uniqueFlightsMap.set(key, flight);
      }
    });

    return Array.from(uniqueFlightsMap.values());
  };

  private formatFlightsData = (response: FlightOfferType[]): FlightType[] => {
    // Extract and format flight data
    const extractFlightData = (flight: FlightOfferType) => {
      const segment = flight.itineraries?.[0]?.segments?.[0];

      return {
        flight_number: segment.number,
        duration: segment.duration
          .replace('PT', '')
          .replace('H', ' H ')
          .replace('M', 'M')
          .trim(),
        origin_code: segment.departure.iataCode,
        destination_code: segment.arrival.iataCode,
        departure_date: segment.departure.at,
        arrival_date: segment.arrival.at,
        travel_class:
          flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin ||
          'N/A',
        price: parseFloat(flight.price?.total) || 0,
        currency_code: flight.price?.currency || 'N/A',
        non_stop: segment.numberOfStops === 0,
        airlineCode: segment.carrierCode,
      };
    };

    const extractedData = response.map((flight) => extractFlightData(flight));
    return extractedData;
  };

  async saveFlight(flightData: FlightType): Promise<void> {
    const flight = this.flightRepo.create(flightData);
    await this.flightRepo.save(flight);
  }
}
