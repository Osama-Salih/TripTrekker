import { Exclude, Expose } from 'class-transformer';
import { RoleEnum } from 'src/roles/role.enum';

export class ResponseGetUsersDTO {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Exclude()
  password: string;

  @Exclude()
  passwordChangedAt?: Date;

  @Exclude()
  passwordResetCode?: string;

  @Exclude()
  passwordResetExpire?: Date;

  @Exclude()
  passwordResetVerify?: boolean;

  @Expose()
  phone: string;

  @Expose()
  gender: string;

  @Exclude()
  isActive: boolean;

  @Exclude()
  role: RoleEnum;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ResponseGetUsersDTO>) {
    Object.assign(this, partial);
  }
}
