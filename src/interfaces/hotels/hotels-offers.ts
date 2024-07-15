export interface HotelOffers {
  type: string;
  hotel: {
    type: string;
    hotelId: string;
    chainCode: string;
    dupeId?: string;
    name: string;
    cityCode: string;
    latitude?: number;
    longitude?: number;
    address?: {
      countryCode?: string;
      stateCode?: string;
    };
    amenities?: string[];
  };
  available: boolean;
  offers: {
    id: string;
    checkInDate: string;
    checkOutDate: string;
    rateCode: string;
    rateFamilyEstimated: {
      code: string;
      type: string;
    };
    description?: {
      text: string;
      lang: string;
    };
    room: {
      type: string;
      typeEstimated: {
        beds: number;
        bedType: string;
      };
      description: {
        text: string;
        lang: string;
      };
    };
    guests: {
      adults: number;
    };
    price: {
      currency: string;
      base: string;
      total: string;
      taxes?: {
        code: string;
        pricingFrequency: string;
        pricingMode: string;
        amount: string;
        currency: string;
        included: boolean;
      }[];
      variations: {
        average?: {
          base: string;
        };
        changes: {
          startDate: string;
          endDate: string;
          base: string;
        }[];
      };
    };
    policies: {
      cancellations: {
        description?: {
          text: string;
        };
        type: string;
      }[];
      paymentType: string;
    };
    self: string;
  }[];
  self: string;
}
[];

interface Data {
  data: HotelOffers;
}

export interface HotelOffersResponse {
  result: Data;
}
