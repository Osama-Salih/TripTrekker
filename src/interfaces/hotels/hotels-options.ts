import { GetHotelQueryDTO } from 'src/hotels/dto/get-hotel-query.dto';

export interface optionsType extends Omit<GetHotelQueryDTO, 'keyword'> {}
