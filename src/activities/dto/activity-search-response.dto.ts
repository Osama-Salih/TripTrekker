import { Exclude, Expose } from 'class-transformer';

class GeoCode {
  @Expose()
  latitude: number;

  @Expose()
  longitude: number;
}

class Self {
  @Expose()
  href: string;

  @Expose()
  methods: string[];
}

class Price {
  @Expose()
  currencyCode: string;

  @Expose()
  amount: string;
}

export class ResponseActivitySearchDTO {
  @Exclude()
  type: string;

  @Expose()
  id: string;

  @Exclude()
  self: Self;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  geoCode: GeoCode;

  @Expose()
  price: Price;

  @Expose()
  pictures: string[];

  @Exclude()
  minimumDuration: string;

  constructor(partial: Partial<ResponseActivitySearchDTO>) {
    Object.assign(this, partial);
  }
}
