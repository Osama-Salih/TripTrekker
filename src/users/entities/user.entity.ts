import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RoleEnum } from '../../roles/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: false, length: 200 })
  firstName: string;

  @Column({ nullable: false, length: 200 })
  lastName: string;

  @Column({ nullable: false, unique: true })
  username: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false })
  phone: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: RoleEnum, default: RoleEnum.USER })
  role: RoleEnum;

  @Column({ type: 'timestamp', nullable: true })
  passwordChangedAt?: Date;

  @Column({ nullable: true })
  passwordResetCode?: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpire?: Date;

  @Column({ nullable: true })
  passwordResetVerify?: boolean;

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
