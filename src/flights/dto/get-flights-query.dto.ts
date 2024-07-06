import {
  IsAlpha,
  IsNotEmpty,
  IsString,
  IsDateString,
  Length,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { TravelClass, AirLine } from '../../interfaces/flights-interface';

export class GetFlightQueryDTO {
  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  @Length(3)
  readonly origin_code: string;

  @IsNotEmpty()
  @IsString()
  @IsAlpha()
  @Length(3)
  readonly destination_code: string;

  @IsNotEmpty()
  @IsDateString()
  readonly departure_date: string;

  @IsNotEmpty()
  @IsString()
  @Length(3)
  readonly currency_code: string;

  @IsOptional()
  @IsDateString()
  readonly return_date: string;

  @IsOptional()
  @IsEnum(TravelClass)
  readonly travel_class: TravelClass;

  @IsOptional()
  @Length(2)
  @IsEnum(AirLine)
  readonly airline_code: AirLine;

  @IsOptional()
  @IsBoolean()
  readonly non_stop: boolean;
}
