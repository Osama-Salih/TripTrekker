export interface FlightType {
  flight_number: string;
  duration: string;
  origin_code: string;
  destination_code: string;
  departure_date: string;
  arrival_date: string;
  travel_class?: string;
  price: number;
  currency_code: string;
  non_stop: boolean;
  airline_code?: string;
  return_date?: string;
}
