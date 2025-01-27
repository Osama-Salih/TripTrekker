import {
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

import { Amenities } from './enums/amenities.enum';
import { optionsType } from './interfaces/hotels-options-interface';
import { HotelApiCityCode } from './interfaces/city-code-interface';

import { HotelType, HotelsAllHotels } from './interfaces/all-hotles-interface';

import {
  HotelOffersResponse,
  HotelOffers,
} from './interfaces/hotels-offers-interface';

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

  async hotelSearch(getHotelQueryDTO: GetHotelQueryDTO): Promise<HotelType[]> {
    const { keyword, ratings, amenities } = getHotelQueryDTO;

    // Cache the options to use them in getHotelAndConfirm method
    await this.cacheManager.set('hotelSearchOptions', getHotelQueryDTO);

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
      await this.cacheManager.set('hotelsData', hotels);
      return hotels;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch hotles');
    }
  }

  async getHotel(hotelId: string): Promise<HotelOffers> {
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
      throw new NotFoundException(
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
      currency,
      adults,
      checkIn,
      checkOut,
      roomQuantity,
      boardType,
      cheapestOffer,
    } = options;

    const {
      result: { data: hotelOffers },
    }: HotelOffersResponse = await this.amadeus.shopping.hotelOffersSearch.get({
      currency,
      adults,
      roomQuantity,
      boardType,
      hotelIds: hotelId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      bestRateOnly: cheapestOffer,
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
      hotelId: hoteData.hotel.hotelId,
      name: hoteData.hotel.name,
      location: hoteData.hotel.address,
      roomType: hoteData.offers[0].room.type,
      amenities: hoteData.hotel.amenities,
      description: hoteData.offers[0].description.text,
      currency: hoteData.offers[0].price.currency,
      price: +hoteData.offers[0].price.total,
    });
    await this.hotelRepo.save(newHotel);
  }
}
