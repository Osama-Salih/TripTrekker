import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { parsePhoneNumberFromString } from 'libphonenumber-js';


@Injectable()
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