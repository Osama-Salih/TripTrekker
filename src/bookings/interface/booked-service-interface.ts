import { Flight } from '../../flights/entities/flight.entity';
import { Hotel } from '../../hotels/entities/hotel.entity';
import { Activity } from '../../activities/entities/activity.entity';

export type BookedService = Flight | Hotel | Activity;
export type BookedServiceType = {
  price: number;
  currency: string;
  cancelUrl: string;
};
