interface Meta {
  count: number;
  links: {
    self: string;
  };
}

interface GeoCode {
  latitude: number;
  longitude: number;
}

interface Address {
  cityName: string;
  cityCode: string;
  countryName: string;
  countryCode: string;
  stateCode: string;
  regionCode: string;
}

interface Analytics {
  travelers: {
    score: number;
  };
}

interface Location {
  type: string;
  subType: string;
  name: string;
  detailedName: string;
  id: string;
  self: {
    href: string;
    methods: string[];
  };
  timeZoneOffset: string;
  iataCode: string;
  geoCode: GeoCode;
  address: Address;
  analytics: Analytics;
}

interface LocationResponse {
  meta: Meta;
  data: Location[];
}

export interface HotelApiCityCode {
  result: LocationResponse;
}
