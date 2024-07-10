import { Exclude } from 'class-transformer';
import { User } from '../entities/user.entity';
import { RoleEnum } from 'src/roles/role.enum';

export class ResponseCreateUserDTO {
  id: number;

  accessToken: string;

  firstName: string;

  lastName: string;

  username: string;

  email: string;

  @Exclude()
  password: string;

  phone: string;

  gender: string;

  @Exclude()
  isActive: boolean;

  @Exclude()
  passwordChangedAt: Date;

  @Exclude()
  role: RoleEnum;

  createdAt: Date;

  updatedAt: Date;

  constructor(user: Partial<User>, accessToken: string) {
    Object.assign(this, { accessToken }, user);
  }
}
