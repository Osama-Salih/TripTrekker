import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { FlightsService } from './flights.service';
import { FlightType } from '../interfaces/flights-interface';
import { GetFlightQueryDTO } from './dto/get-flights-query.dto';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  async getFlights(
    @Query() query: GetFlightQueryDTO,
  ): Promise<FlightType[] | Error> {
    return this.flightsService.getFlights(query);
  }

  @Get(':flightNumber')
  async chosenFlight(
    @Param('flightNumber', ParseIntPipe) flightNumber: number,
  ): Promise<FlightType | Error> {
    return this.flightsService.getFlightAndConfirm(flightNumber);
  }
}
