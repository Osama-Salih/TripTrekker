import { RoleEnum } from '../../roles/role.enum';

export type processedRelations = {
  relations: string[];
  userRole: RoleEnum;
  userId: number;
};
