import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  activityId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'json', nullable: false })
  location: string;

  @Column({ type: 'decimal', nullable: false })
  price: number;

  @Column({ type: 'varchar', length: 3, nullable: true, default: 'USD' })
  currency: string;

  @Column({ type: 'simple-array', nullable: false })
  pictures: string[];
}
