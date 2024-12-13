import { CURRENCY_CODE } from '@app/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  isDefined,
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
  ValidateIf,
} from 'class-validator';

export class OnusMembershipQueryDto {
  @ApiProperty({ type: String })
  @IsPhoneNumber('VN')
  @ValidateIf(
    (o: OnusMembershipQueryDto) => isDefined(o.phone) || !isDefined(o.email),
  )
  readonly phone: string;

  @ApiProperty({ type: String })
  @IsEmail()
  @ValidateIf(
    (o: OnusMembershipQueryDto) => isDefined(o.email) || !isDefined(o.phone),
  )
  readonly email: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsNumberString()
  readonly amount: string;

  @ApiProperty({ type: String })
  @IsOptional()
  readonly vndcUserId: string;

  @ApiProperty({ type: String })
  @IsOptional()
  readonly currency: CURRENCY_CODE;
}

export class OnusCallbackRequestDto extends OnusMembershipQueryDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  transactionNumber: string;
}

export class OnusResponseDto {
  status: string;

  message: string;

  errorCode?: string;

  data?: { fullName: string; phone: string; email: string };
}
