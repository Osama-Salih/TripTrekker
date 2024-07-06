import { Length } from 'class-validator';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false, length: 200, unique: true })
  firstName: string;

  @Column({ nullable: false, length: 200 })
  lastName: string;

  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  @Length(6, 30, {
    message:
      'The password must be at least 6 but no longer then 30 characters.',
  })
  password: string;

  @Column({ nullable: false })
  phone: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'user' })
  role: 'admin' | 'user';

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
