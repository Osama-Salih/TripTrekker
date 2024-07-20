import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  IsEnum,
  IsDateString,
  IsArray,
  ArrayNotEmpty,
  ArrayMaxSize,
  IsInt,
  Length,
} from 'class-validator';
import { BoardType } from '../enums/board-type.enum';
import { Amenities } from '../enums/amenities.enum';
import { Type } from 'class-transformer';

export class GetHotelQueryDTO {
  @IsNotEmpty()
  @IsString()
  readonly keyword: string;

  @IsOptional()
  @IsDateString({}, { message: 'checkIn must be a valid date string' })
  readonly checkIn?: string;

  @IsOptional()
  @IsDateString({}, { message: 'checkOut must be a valid date string' })
  readonly checkOut?: string;

  @IsNotEmpty()
  @IsString()
  @Length(3)
  readonly currency: string;

  @IsOptional()
  @Min(1)
  @Max(9, { message: 'The maximum rooms available per person is 9' })
  readonly roomQuantity?: number;

  @IsOptional()
  @Min(1)
  @Max(9, { message: 'The maximum adult guests is 9 per room.' })
  readonly adults?: number;

  @IsOptional()
  @IsEnum(BoardType, { message: 'boardType must be a valid BoardType' })
  readonly boardType?: BoardType;

  @IsOptional()
  @IsBoolean({ message: 'cheapestOffer must be a boolean value' })
  readonly cheapestOffer?: boolean;

  @IsOptional()
  @IsEnum(Amenities, {
    each: true,
    message: 'Each amenity must be a valid Amenities value',
  })
  @IsArray({ message: 'Amenities must be an array' })
  @ArrayNotEmpty({ message: 'Amenities array should not be empty' })
  readonly amenities?: Amenities[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4, {
    message: 'You can provide up to four ratings at the same time.',
  })
  @IsInt({ each: true, message: 'Each rating must be an integer value.' })
  @Type(() => Number)
  readonly ratings?: number[];
}
