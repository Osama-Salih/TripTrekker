import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TravelClass, AirLine } from '../../interfaces/flights-interface';

@Entity()
export class Flight {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  flight_number: string;

  @Column()
  duration: string;

  @Column({ nullable: false })
  origin_code: string;

  @Column({ nullable: false })
  destination_code: string;

  @Column({ type: 'enum', enum: AirLine, nullable: true })
  airline_code: AirLine;

  @Column({ type: 'datetime', nullable: false })
  departure_date: Date;

  @Column({ type: 'datetime', nullable: false })
  arrival_date: Date;

  @Column({
    type: 'enum',
    enum: TravelClass,
    default: TravelClass.ECONOMY,
  })
  travel_class: TravelClass;

  @Column({ type: 'decimal', nullable: false })
  price: number;

  @Column({ type: 'varchar', length: 3, nullable: false })
  currency_code: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  non_stop: boolean;

  @Column({ type: 'datetime', nullable: true })
  return_date?: Date;
}
