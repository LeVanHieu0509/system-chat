import { CURRENCY_CODE } from '@app/common';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

const IsSameAccount = (
  property: string,
  validationOptions?: ValidationOptions,
) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isSameAccount',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: number, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value !== relatedValue;
        },
      },
    });
  };
};

export class RequestParamDto {
  params?: Record<string, string>;
  query?: Record<string, string>;
  userId?: string;
  phone?: string;
}

export class ConfirmOffChainRequestDto extends RequestParamDto {
  @IsString()
  @IsSameAccount('userId', { message: 'Receiver account is not valid' })
  readonly receiverId: string;

  @IsPositive()
  readonly amount: number;

  @IsString()
  readonly currencyId: string;

  @IsNotEmpty()
  readonly token: string;
}

export class SendOffChainRequestDto extends ConfirmOffChainRequestDto {
  @IsNotEmpty()
  readonly token: string;
}

export class InquiryRequestDto extends RequestParamDto {
  @IsOptional()
  @IsPhoneNumber('VN')
  readonly phone: string;

  @IsOptional()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly currencyId: string;

  @IsNotEmpty()
  @IsNumber()
  readonly amount: number;
}

export class PasscodeOffChainRequestDto extends RequestParamDto {
  @IsNotEmpty()
  readonly token: string;

  @IsNotEmpty()
  readonly passcode: string;
}

export class OTPOffChainRequestDto extends RequestParamDto {
  @IsNotEmpty()
  readonly token: string;

  @IsNotEmpty()
  readonly otp: number;
}

export interface CampaignsQueryDto extends Record<string, unknown> {
  categoryId: string;
  sort: string;
}

export interface AccountBalance {
  id: string;
  deviceToken: string;
  amount?: number;
  incoming?: number;
  outgoing?: number;
  balance?: number;
}

export class AccountCoinDto {
  amount: number;
  currencyId: string;
  currency: CURRENCY_CODE;
  pending: number;
}
