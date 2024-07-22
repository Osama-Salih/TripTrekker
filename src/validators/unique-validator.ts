import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { EntityManager } from 'typeorm';


@Injectable()
@ValidatorConstraint({ name: 'IsUniqueConstraint ', async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly entityManager: EntityManager) {}
  async validate(value: unknown, args?: ValidationArguments): Promise<boolean> {
    const { tableName, column }: IsUniqueInterface = args.constraints[0];

    const record = await this.entityManager
      .getRepository(tableName)
      .createQueryBuilder(tableName)
      .where(`${tableName}.${column} = :value`, { value })
      .getOne();
    return !record;
  }

  defaultMessage(args?: ValidationArguments): string {
    const field: string = args.property;
    return `${field} already exists.`;
  }
}

export type IsUniqueInterface = {
    tableName: string;
    column: string;
  };

  
export function IsUnique(
    option: IsUniqueInterface,
    validationOptions?: ValidationOptions,
  ) {
    return function (object: object, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        constraints: [option],
        validator: IsUniqueConstraint,
      });
    };
  }