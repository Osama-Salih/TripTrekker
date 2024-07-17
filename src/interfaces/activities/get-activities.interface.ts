export interface ActivityType {
  type: string;
  id: string;
  self?: {
    href: string;
    methods: string[];
  };
  name: string;
  description: string;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  price: {
    currencyCode: string;
    amount: string;
  };
  pictures: string[];
  minimumDuration?: string;
}

export interface ActivitiesResponse {
  data: ActivityType[];
}

export interface Activities {
  result: ActivitiesResponse;
  meta?: {
    links: {
      self: string;
    };
  };
}
