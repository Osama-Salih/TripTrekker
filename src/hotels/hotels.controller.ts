import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../roles/role.guard';
import { Roles } from '../roles/role.decorator';
import { RoleEnum } from '../roles/role.enum';

import { GetHotelQueryDTO } from './dto/get-hotel-query.dto';
import { HotelType } from '../interfaces/hotels/hotels-api-all-hotles';
import { HotelOffers } from '../interfaces/hotels/hotels-offers';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get('search')
  async hotelSearch(
    @Query() getHotelQueryDTO: GetHotelQueryDTO,
  ): Promise<HotelType[] | InternalServerErrorException> {
    return this.hotelsService.hotelSearch(getHotelQueryDTO);
  }

  @Get(':hotelId')
  async hotelOffers(
    @Param('hotelId') hotelId: string,
  ): Promise<HotelOffers | BadRequestException | InternalServerErrorException> {
    return this.hotelsService.getHotel(hotelId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleEnum.USER)
  @Get('confirm/:hotelId')
  hotelConfirm(@Param('hotelId') hotelId: string): Promise<void> {
    return this.hotelsService.hotelConfirm(hotelId);
  }
}
