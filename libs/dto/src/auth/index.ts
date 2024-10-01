'use strict';

import { OTP_TYPE } from '@app/common/constants';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import {
  Allow,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export type Auth = { userId: string; phone?: string };

export class OTPRequestDto {
  @Allow()
  @IsOptional()
  @IsPhoneNumber('VN', { message: VALIDATE_MESSAGE.ACCOUNT.PHONE_INVALID })
  readonly phone: string;

  @Allow()
  @IsNotEmpty({ message: VALIDATE_MESSAGE.ACCOUNT.TYPE_REQUIRED })
  @IsEnum(OTP_TYPE, { message: VALIDATE_MESSAGE.ACCOUNT.TYPE_INVALID })
  readonly type: string;

  @Allow()
  @IsOptional()
  @IsEmail(undefined, { message: VALIDATE_MESSAGE.ACCOUNT.EMAIL_INVALID })
  readonly email?: string;
}

export class OTPTypeRequestDto {
  @IsString()
  readonly type: string;
}
