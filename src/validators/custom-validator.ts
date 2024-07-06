import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { EntityManager } from 'typeorm';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

@ValidatorConstraint({ name: 'IsUniqueConstraint ', async: true })
@Injectable()
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

@ValidatorConstraint({ name: 'IsPhoneNumberConstraint ', async: false })
export class IsPhoneNumberConstraint implements ValidatorConstraintInterface {
  validate(phoneNumber: unknown) {
    if (typeof phoneNumber !== 'string') return false;
    const phoneNumberParsed = parsePhoneNumberFromString(phoneNumber);
    return phoneNumberParsed ? phoneNumberParsed.isValid() : false;
  }

  defaultMessage() {
    return 'invalid phone number';
  }
}

export function IsPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPhoneNumberConstraint,
    });
  };
}
