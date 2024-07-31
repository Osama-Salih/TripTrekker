import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Activity } from '../../activities/entities/activity.entity';
import { Flight } from '../../flights/entities/flight.entity';
import { Hotel } from '../../hotels/entities/hotel.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'timestamp', nullable: false })
  bookingDate: Date;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToOne(() => Flight, { nullable: true })
  flight?: Flight;

  @ManyToOne(() => Hotel, { nullable: true })
  hotel?: Hotel;

  @ManyToOne(() => Activity, { nullable: true })
  activity?: Activity;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;
}
