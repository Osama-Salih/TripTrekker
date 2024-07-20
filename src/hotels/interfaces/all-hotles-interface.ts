interface GeoCode {
  latitude: number;
  longitude: number;
}

interface Address {
  countryCode: string;
}

export interface HotelType {
  chainCode: string;
  iataCode: string;
  dupeId: number;
  name: string;
  hotelId: string;
  geoCode: GeoCode;
  address: Address;
  lastUpdate: string;
}

export interface Data {
  data: HotelType[];
}

export interface HotelsAllHotels {
  result: Data;
}
