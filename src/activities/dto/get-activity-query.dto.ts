import {
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class GetActivityQueryDTO {
  @IsNotEmpty()
  @IsNumber()
  @IsLatitude()
  readonly latitude: number;

  @IsNotEmpty()
  @IsNumber()
  @IsLongitude()
  readonly longitude: number;

  @IsOptional()
  @IsNumber()
  @IsInt()
  readonly radiusInKilometers?: number;
}
