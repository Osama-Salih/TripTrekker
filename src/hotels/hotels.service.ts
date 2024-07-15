import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Inject,
  NotFoundException,
} from '@nestjs/common';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Amadeus = require('amadeus');

import { Amenities } from '../interfaces/hotels/hotels.enum';
import { optionsType } from '../interfaces/hotels/hotels-options';
import { HotelApiCityCode } from '../interfaces/hotels/hotels-api-city-code';
import {
  HotelType,
  HotelsAllHotels,
} from '../interfaces/hotels/hotels-api-all-hotles';
import {
  HotelOffersResponse,
  HotelOffers,
} from '../interfaces/hotels/hotels-offers';

import { GetHotelQueryDTO } from './dto/get-hotel-query.dto';
import { Hotel } from './entities/hotel.entity';

@Injectable()
export class HotelsService {
  private amadeus;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Hotel)
    private readonly hotelRepo: Repository<Hotel>,
  ) {
    this.amadeus = new Amadeus();
  }

  async hotelSearch(
    getHotelQueryDTO: GetHotelQueryDTO,
  ): Promise<HotelType[] | InternalServerErrorException> {
    const { keyword, ratings, amenities } = getHotelQueryDTO;

    // Cache the options to use them in getHotelAndConfirm method
    await this.cacheManager.set(
      'hotelSearchOptions',
      getHotelQueryDTO,
      3600000,
    ); // ttl cache for one hour

    // Convert ratings and amenities arrays to comma-separated string
    const ratingsParam = ratings?.length > 1 ? ratings.join(',') : ratings;
    const amenitiesParam =
      amenities?.length > 1 ? amenities.join(',') : amenities;

    try {
      const cityCode = await this.getCityCodeFromKeyword(keyword);

      const hotels = await this.getAllHotels(
        cityCode,
        ratingsParam,
        amenitiesParam,
      );

      // Cache hotles data to use it in getHotelAndConfirm method
      await this.cacheManager.set('hotelsData', hotels, 3600000); // ttl cache for one hour
      return hotels;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch hotles');
    }
  }

  async getHotel(
    hotelId: string,
  ): Promise<HotelOffers | BadRequestException | InternalServerErrorException> {
    const cachedHotelsData: HotelType[] = await this.getCachedHotelsData();

    // Find the hotle with the given hotelId
    this.validateHotelId(hotelId, cachedHotelsData);

    try {
      const options: optionsType = await this.getCachedHotelsOptionsData();

      // Get hotle offers
      const offerId = await this.fetchHotelsOffers(hotelId, options);
      const {
        result: { data },
      }: HotelOffersResponse = await this.amadeus.shopping
        .hotelOfferSearch(offerId)
        .get();

      return data;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch hotel offers');
    }
  }

  async hotelConfirm(hotelId: string): Promise<void> {
    const confirmedHotel = (await this.getHotel(hotelId)) as HotelOffers;
    this.saveHotel(confirmedHotel);
  }

  private async getCityCodeFromKeyword(keyword: string): Promise<string> {
    const {
      result: { data },
    }: HotelApiCityCode = await this.amadeus.referenceData.locations.get({
      keyword,
      subType: Amadeus.location.city,
    });

    if (!data || data.length === 0) {
      throw new NotFoundException('No city found with the given keyword');
    }

    const cityCode = data[0].address.cityCode;
    return cityCode;
  }

  private async getAllHotels(
    cityCode: string,
    ratingsParam: string | number[],
    amenitiesParam: string | Amenities[],
  ): Promise<HotelType[]> {
    const {
      result: { data: hotels },
    }: HotelsAllHotels =
      await this.amadeus.referenceData.locations.hotels.byCity.get({
        cityCode,
        ratings: ratingsParam,
        amenities: amenitiesParam,
      });

    return hotels;
  }

  private async getCachedHotelsData(): Promise<HotelType[]> {
    const cachedHotelsData: HotelType[] =
      await this.cacheManager.get('hotelsData');
    return cachedHotelsData;
  }

  private validateHotelId(
    hotelId: string,
    cachedHotelsData: HotelType[],
  ): void {
    const isValidHotel = cachedHotelsData.find(
      (hotel) => hotel.hotelId === hotelId,
    );
    if (!isValidHotel) {
      throw new BadRequestException(
        `Hotle with number (${hotelId}) not found, Please send a GET hotles/search request and chose the correct hotle number.`,
      );
    }
  }

  private async getCachedHotelsOptionsData(): Promise<optionsType> {
    const options: optionsType =
      await this.cacheManager.get('hotelSearchOptions');
    return options;
  }

  private async fetchHotelsOffers(
    hotelId: string,
    options: optionsType,
  ): Promise<string> {
    const {
      result: { data: hotelOffers },
    }: HotelOffersResponse = await this.amadeus.shopping.hotelOffersSearch.get({
      hotelIds: hotelId,
      adults: options?.adults,
      checkInDate: options?.checkIn,
      checkOutDate: options?.checkOut,
      roomQuantity: options?.roomQuantity,
      boardType: options?.boardType,
      bestRateOnly: options?.cheapestOffer,
    });

    // Send confirmation request to amadeus api.
    const offerId = hotelOffers[0].offers[0].id;
    if (!offerId) {
      throw new NotFoundException('No offer found for this hotel.');
    }

    return offerId;
  }

  private async saveHotel(hoteData: Partial<HotelOffers>): Promise<void> {
    const newHotel = this.hotelRepo.create({
      name: hoteData.hotel.name,
      location: hoteData.hotel.address,
      roomType: hoteData.offers[0].room.type,
      amenities: hoteData.hotel.amenities,
      description: hoteData.offers[0].description.text,
      price: hoteData.offers[0].price.total,
    });
    await this.hotelRepo.save(newHotel);
  }
}
