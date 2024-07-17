import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'json', nullable: false })
  location: string;

  @Column({ type: 'decimal', nullable: false })
  price: string;

  @Column({ type: 'simple-array', nullable: false })
  pictures: string[];
}
