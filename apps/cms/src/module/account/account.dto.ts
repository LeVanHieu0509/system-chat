import { CURRENCY_CODE, KYC_STATUS, STATUS, ToBoolean } from '@app/common';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import {
  CommonPaginationResponseDto,
  CommonResponseDto,
  PaginationDto,
  SortQueryDto,
} from '@app/dto';
import {
  Allow,
  IsBase64,
  IsBooleanString,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Mixin } from 'ts-mixer';

const OperatorFilterRegex = /^(=|>|<|>=|<=),?(\d*)$/;

export class ReferralUsersResponseDto {
  readonly id: string;

  readonly phone: string;

  readonly avatar: string;

  readonly fullName: string;

  readonly email: string;

  readonly amount: number;

  readonly createdAt: string;
}

export class AccountsReferralResponseDto {
  readonly page: number;

  readonly totalRecords: number;

  readonly data: Record<string, unknown>;
}

export class AccountResponseDto extends ReferralUsersResponseDto {
  readonly status: number;

  readonly kycStatus: number;

  readonly deviceToken: string;

  readonly referralCode: string;

  readonly updatedAt: string;
}

export class ReferralUsersQueryDto extends PaginationDto {
  @Allow()
  @IsOptional()
  @IsString()
  keyword: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  from: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  to: number;

  @IsOptional()
  @IsIn([
    KYC_STATUS.EMPTY,
    KYC_STATUS.PENDING,
    KYC_STATUS.APPROVED,
    KYC_STATUS.REJECTED,
  ])
  kycStatus: number;
}

class AccountSortQueryDto extends SortQueryDto {
  sortKey: string;
}

export class AccountQueryDto extends Mixin(AccountSortQueryDto, PaginationDto) {
  @Allow()
  @IsOptional()
  @IsString()
  keyword: string;

  @Allow()
  @IsOptional()
  @ToBoolean()
  isPartner: string;

  @Allow()
  @IsOptional()
  @IsNumber()
  @IsEnum(KYC_STATUS, { message: VALIDATE_MESSAGE.ACCOUNT.KYC_STATUS_INVALID })
  kycStatus: number;

  @Allow()
  @IsOptional()
  @IsNumber()
  @IsEnum(STATUS, { message: VALIDATE_MESSAGE.ACCOUNT.STATUS_INVALID })
  status: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  from: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  to: number;

  @IsOptional()
  @IsBooleanString()
  isReferral: string;

  @IsOptional()
  @IsString()
  token: string;

  @IsOptional()
  @IsString()
  @Matches(OperatorFilterRegex)
  value: string;
}

export class AccountsResponseDto {
  readonly page: number;

  readonly totalRecords: number;

  readonly data: Record<string, unknown>;
}

export class AccountRequestDto {
  @IsOptional()
  @IsString()
  @IsPhoneNumber('VN', { message: VALIDATE_MESSAGE.ACCOUNT.PHONE_INVALID })
  phone: string;

  @IsOptional()
  @IsEnum(STATUS)
  status: number;

  @IsOptional()
  @IsString()
  reason: string;
}

export class AccountResetPasscodeDto {
  @IsString()
  @IsBase64()
  passcode: string;
}

export class AccountWalletResponseDto extends CommonPaginationResponseDto {
  readonly data: unknown;
}

export class AccountWalletInfoResponseDto {
  readonly amountAvailable: number;

  readonly amountPending: number;
}

export class SendNotificationRequestDto {
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(255)
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  @IsString()
  readonly description: string;
}

export class SendNotificationQueryDto {
  @Allow()
  @IsOptional()
  @ToBoolean()
  readonly isPartner: string;

  @Allow()
  @IsOptional()
  @IsNumber()
  @IsEnum(KYC_STATUS)
  readonly kycStatus: number;

  @Allow()
  @IsOptional()
  @ToBoolean()
  readonly isWithdrawal: string;
}

export class SendNotificationResponseDto {
  readonly totalAccounts: number;
}

export class AccountKycResponseDto extends CommonResponseDto {
  readonly data: unknown;
}

export class CashbackQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @IsEnum(CURRENCY_CODE, {
    message: VALIDATE_MESSAGE.CASHBACK.CURRENCY_REQUIRED,
  })
  readonly currency: string;
}
