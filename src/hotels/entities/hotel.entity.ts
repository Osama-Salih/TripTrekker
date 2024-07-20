import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('hotels')
export class Hotel {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  hotelId: string;

  @Column({ type: 'varchar', length: 3, nullable: false })
  currency: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'json', nullable: false })
  location: Record<string, string>;

  @Column({ nullable: false })
  roomType: string;

  @Column({ type: 'simple-array', nullable: true })
  amenities: string[];

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'decimal', nullable: false })
  price: number;
}
