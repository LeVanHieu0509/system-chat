'use strict';

import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import { Language } from '@prisma/client';
import {
  Allow,
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';
import { CommonResponseDto, PaginationDto, VersionQueryDto } from '../common';
// import { ethers } from 'ethers';
import {
  CASHBACK_STATUS,
  CURRENCY_CODE,
  OTP_TYPE,
  REFERRAL_TYPE,
  TRANSACTION_HISTORY_TYPE,
} from '@app/common/constants';
import { ToBoolean } from '@app/common/decorators';
import { ApiProperty } from '@nestjs/swagger';

// const IsBEP20 = (property: string, validationOptions?: ValidationOptions) => {
//   // eslint-disable-next-line @typescript-eslint/ban-types
//   return function (object: Object, propertyName: string) {
//     registerDecorator({
//       name: 'IsBEP20',
//       target: object.constructor,
//       propertyName: propertyName,
//       constraints: [property],
//       options: validationOptions,
//       validator: {
//         validate(value: string) {
//           return !value || ethers.utils.isAddress(value);
//         },
//       },
//     });
//   };
// };

export type Auth = { userId: string; phone?: string };

export type Account = {
  id?: string;
  avatar?: string;
  fullName?: string;
  email?: string;
  passcode?: string;
  phone?: string;
  status?: number;
  kycStatus?: number;
  createdAt?: Date;
  updatedAt?: Date;
  coinId?: number;
  referralBy?: string;
  referralCode?: string;
  emailVerified?: boolean;
  googleId?: string;
  facebookId?: string;
  appleId?: string;
  histories?: {
    histories: { updatedAt: string; updatedById?: string; reason: string }[];
  };
  giftAddress?: string;
  walletAddress?: string;
};

export class OTPTypeRequestDto {
  @IsString()
  readonly type: string;
}

export class OTPRequestDto {
  @ApiProperty({ type: String })
  @Allow()
  @IsOptional()
  @IsPhoneNumber('VN', { message: VALIDATE_MESSAGE.ACCOUNT.PHONE_INVALID })
  readonly phone: string;

  @ApiProperty({ type: String })
  @Allow()
  @IsNotEmpty({ message: VALIDATE_MESSAGE.ACCOUNT.TYPE_REQUIRED })
  @IsEnum(OTP_TYPE, { message: VALIDATE_MESSAGE.ACCOUNT.TYPE_INVALID })
  readonly type: string;

  @ApiProperty({ type: String })
  @Allow()
  @IsOptional()
  @IsEmail(undefined, { message: VALIDATE_MESSAGE.ACCOUNT.EMAIL_INVALID })
  readonly email?: string;
}

export class OTPResponseDto extends CommonResponseDto {
  readonly data: Record<string, unknown>;
}

export class FindAccountRequestDto {
  @ApiProperty({ type: String })
  @Allow()
  @IsOptional()
  @IsEmail(undefined, { message: VALIDATE_MESSAGE.ACCOUNT.EMAIL_INVALID })
  readonly email?: string;

  @ApiProperty({ type: String })
  @Allow()
  @IsOptional()
  @IsPhoneNumber('VN', { message: VALIDATE_MESSAGE.ACCOUNT.PHONE_INVALID })
  readonly phone?: string;
}

class PasscodeDto {
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.PASSCODE_INVALID })
  readonly passcode: string;
}
export class PasscodeRequestDto extends PasscodeDto {
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.PASSCODE_INVALID })
  readonly currentPasscode: string;
}

export class SigninRequestDto extends PasscodeDto {
  @IsPhoneNumber('VN', { message: VALIDATE_MESSAGE.ACCOUNT.PHONE_INVALID })
  readonly phone: string;
}

export class AccessTokenRequestDto {
  @ApiProperty({ type: String })
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_INVALID })
  readonly accessToken: string;
}

export interface TokenPayloadDto {
  expiresIn: number;
  accessToken: string;
  refreshToken: string;
}

export class SignupRequestDto {
  @ApiProperty({ type: String })
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.PASSCODE_INVALID })
  readonly passcode: string;

  @ApiProperty({ type: String })
  @Allow()
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_STRING })
  readonly token: string;

  @ApiProperty({ type: String })
  @Allow()
  @IsOptional()
  readonly referralBy: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.FULL_NAME_STRING })
  readonly fullName: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.AVATAR_STRING })
  readonly avatar: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsEmail(undefined, { message: VALIDATE_MESSAGE.ACCOUNT.EMAIL_INVALID })
  readonly email: string;
}

export class AccountDto {
  id: string;
  phone: string;
  passcode: string;
  status: number;
  fullName: string;
  referralById?: string;
}

export class VerifyOTPRequestDto extends OTPRequestDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.OTP_STRING })
  otp: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_STRING })
  token: string;
}

export class CheckPhoneRequestDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsPhoneNumber('VN', { message: VALIDATE_MESSAGE.ACCOUNT.PHONE_INVALID })
  phone: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  otp: string;
}

export class ResetPasscodeRequestDto extends SigninRequestDto {
  @IsNotEmpty()
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_STRING })
  token: string;
}

export class RefreshTokenRequestDto {
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_STRING })
  readonly token: string;
}

export class UserProfileRequestDto {
  @IsOptional()
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.FULL_NAME_STRING })
  readonly fullName: string;

  @IsOptional()
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.AVATAR_STRING })
  readonly avatar: string;

  @IsOptional()
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.COIN_ID_NUMBER })
  readonly currencyId: string;

  @IsOptional()
  @IsUrl(undefined, { message: VALIDATE_MESSAGE.ACCOUNT.REFERRAL_LINK_INVALID })
  readonly referralLink: string;

  @IsOptional()
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.WALLET_ADDRESS })
  // @IsBEP20('walletAddress', {
  //   message: VALIDATE_MESSAGE.ACCOUNT.WALLET_ADDRESS,
  // })
  readonly walletAddress: string;

  @IsOptional()
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.GIFT_ADDRESS })
  readonly giftAddress: string;
}

class EmailRequest {
  @IsNotEmpty()
  @IsEmail(undefined, { message: VALIDATE_MESSAGE.ACCOUNT.EMAIL_INVALID })
  readonly email: string;
}

export class ChangeEmailRequestDto extends EmailRequest {
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.PASSCODE_INVALID })
  readonly passcode: string;
}

export class ConfirmEmailRequestDto extends EmailRequest {
  @IsNotEmpty()
  @IsNumber(undefined, { message: VALIDATE_MESSAGE.ACCOUNT.OTP_INVALID })
  otp: number;
}

export class SignupResponse {
  readonly id: string;

  readonly phone: string;

  readonly fullName: string;

  readonly status: number;

  readonly email: string;

  readonly referralCode: string;
}
export class SignupResponseDto extends CommonResponseDto {
  readonly data: Record<string, unknown>;
}

export class VerifyOTPResponseDto extends CommonResponseDto {
  readonly data: Record<string, unknown>;
}

export class SignUpResponseDto extends CommonResponseDto {
  readonly data: Record<string, unknown>;
}

class SignInResponse {
  readonly expiresIn: number;

  readonly accessToken: number;

  readonly refreshToken: number;
}

export class SignInResponseDto extends CommonResponseDto {
  readonly data: Record<string, unknown>;
}

export class ResetPasscodeResponseDto extends CommonResponseDto {
  readonly data: Record<string, unknown>;
}

export class UserProfileResponseDto extends CommonResponseDto {
  readonly data: Record<string, unknown>;
}

export class ChangePasscodeResponseDto extends CommonResponseDto {
  readonly data: Record<string, unknown>;
}

export class UserProfileDto {
  fullName?: string;
  avatar?: string;
  email?: string;
  coinId?: number;
  passcode?: string;
  currentPasscode?: string;
  giftAddress?: string;
  walletAddress?: string;
}

export class TransactionQueryDto extends VersionQueryDto {
  @IsOptional()
  @IsNumber()
  @IsEnum(CASHBACK_STATUS, {
    message: VALIDATE_MESSAGE.CASHBACK.STATUS_INVALID,
  })
  readonly status: number;

  @IsOptional()
  @IsString()
  @IsEnum(CURRENCY_CODE, {
    message: VALIDATE_MESSAGE.CASHBACK.CURRENCY_REQUIRED,
  })
  readonly currency: string;
}

export class TransactionHistoryQueryDto extends TransactionQueryDto {
  @IsNumber()
  @IsEnum(TRANSACTION_HISTORY_TYPE, {
    message: VALIDATE_MESSAGE.ACCOUNT.TYPE_INVALID,
  })
  readonly type: number;
}

export class TransactionCashbackQueryDto extends TransactionQueryDto {}

class TransactionHistory {
  readonly description: string;

  readonly type: number;

  readonly amount: unknown;

  readonly fee: unknown;

  readonly updatedAt: Date;
}

export class TransactionHistoryResponseDto extends CommonResponseDto {
  readonly page: number;

  readonly totalRecords: number;

  readonly data: Record<string, unknown>;
}

//Referral

export class ReferralQueryDto extends VersionQueryDto {
  @IsOptional()
  @IsNumber()
  @IsEnum(REFERRAL_TYPE, { message: VALIDATE_MESSAGE.REFERRAL.TYPE_INVALID })
  readonly type: number;
}

export class UsersResponseDto extends CommonResponseDto {
  readonly page: number;

  readonly totalRecords: number;

  readonly data: Record<string, unknown>;
}

export class AccountReferralRequestDto {
  @IsNotEmpty({ message: VALIDATE_MESSAGE.REFERRAL.REFERRAL_BY_REQUIRED })
  @IsNumber(undefined, {
    message: VALIDATE_MESSAGE.REFERRAL.REFERRAL_BY_NUMBER,
  })
  referralBy: number;
}

export type AccountReferral = { referralFrom: string; referralBy: string };

//KYC
export class KYCChangeStatusRequestDto {
  @IsString()
  message: string;
}

export class KYCSubmitResponseDto extends CommonResponseDto {
  readonly data: Record<string, unknown>;
}

export class KYCCheckResponseDto extends CommonResponseDto {
  readonly data: Record<string, unknown>;
}

export interface KYCStatusResponseDto {
  kycPhoto?: { status?: number; reason?: string };
  kycVideo?: { status?: number; reason?: string };
}

export class KYCFileRequestDto {
  photoFront?: Express.Multer.File[];
  photoBack?: Express.Multer.File[];
  selfieVideo?: Express.Multer.File[];
  docType?: number;
}

export interface KYCSubmitDto {
  docType?: number;
  selfieVideo?: string;
  photoFront?: string;
  photoBack?: string;
  id?: string;
  videoStatus?: number;
  photoStatus?: number;
}

export type Contact = { phone: string; name: string };

export class SyncContactRequestDto {
  @IsNotEmpty()
  @IsArray({ message: VALIDATE_MESSAGE.CONTACT.CONTACT_INVALID })
  readonly contacts: unknown;
}

export class SyncContactResponseDto extends CommonResponseDto {
  readonly data: Contact[];
}

// Setting account
export class SettingAccountRequestDto {
  @Allow()
  @ToBoolean()
  @IsBoolean({ message: VALIDATE_MESSAGE.SETTING.RECEIVE_NOTIFY_INVALID })
  readonly receiveNotify: string;
}

export class UpdateAccountSettingBodyDto {
  @IsOptional()
  @IsBoolean()
  receiveNotify: boolean;

  @IsOptional()
  @IsEnum(Language)
  language: Language;
}

export class UpdateDeviceTokenRequestDto {
  @Allow()
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.DEVICE_TOKEN_INVALID })
  readonly deviceToken: string;
}

export class SettingAccountResponseDto extends KYCSubmitResponseDto {}

// Notification
export class NotificationDto {
  readonly id: string;

  readonly type: number;

  readonly cashbackRef: number;

  readonly icon: string;

  readonly seen: boolean;

  readonly title: string;

  readonly description: string;

  readonly createdAt: Date;
}
export class NotificationResponseDto extends CommonResponseDto {
  data: unknown;
}

export class UnreadNotificationResponseDto extends CommonResponseDto {
  data: unknown;
}

export class ReadAllNotificationRequestDto {
  @IsNotEmpty()
  @IsDate({ message: VALIDATE_MESSAGE.NOTIFICATION.DATE_INVALID })
  readonly at: Date;
}

// upload
export class UploadResponseCommon {
  readonly url: string;
}

export class UploadResponseDto extends CommonResponseDto {
  data: unknown;
}

// CMS Account
class CashbackDto {
  readonly type: number;

  readonly status: number;

  readonly description: string;

  readonly createdAt: Date;

  readonly updatedAt: Date;

  readonly amount: unknown;

  readonly fee: unknown;

  readonly currency: unknown;
}

export class CMSCashbackResponseDto {
  readonly page: number;

  readonly totalRecords: number;

  readonly data: Record<string, unknown>;
}

class WithDrawDto extends TransactionHistory {
  readonly status: number;

  readonly createdAt: Date;
}

export class CMSWithdrawResponseDto {
  readonly balance: number;

  readonly page: number;

  readonly totalRecords: number;

  readonly data: Record<string, unknown>;
}

export class CMSKycResponseDto {
  readonly docType: number;

  readonly photoFront: string;

  readonly photoBack: string;

  readonly status: unknown;

  readonly createdAt: Date;

  readonly updatedAt: Date;
}

export class CMSNotificationResponse {
  readonly page: number;

  readonly totalRecords: number;

  data: unknown;
}

export class IntroduceResponseDto extends CommonResponseDto {
  readonly data: unknown;
}

export class BannersResponseDto extends CommonResponseDto {
  readonly data: unknown;
}

export class AdsBannerResponseDto extends CommonResponseDto {
  readonly data: unknown;
}

export class DailyLuckyWheelResponseDto extends CommonResponseDto {
  readonly data: unknown;
}

export class LuckyWheelResponseDto extends CommonResponseDto {
  readonly data: unknown;
}

export type DailyRewardCaching = {
  accountId: string;
  dailyRewardId: string;
  title: string;
  reward: number;
  approval: number;
  type: number;
  currency: { id: string; code: string; name: string };
};

export class VerifyPasscodeSigninRequestDto extends PasscodeDto {
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_INVALID })
  readonly token: string;
}

export class VerifyPasscodeRequestDto extends PasscodeDto {}

export class SignInThirdPartyResponseDto extends CommonResponseDto {
  readonly data: Record<string, unknown>;
}

export class AccountDashboardResponseDto extends CommonResponseDto {
  readonly data: Record<string, unknown>;
}

export class AccountCommissionHistoriesResponseDto extends CommonResponseDto {
  readonly page: number;

  readonly totalRecords: number;

  readonly data: Record<string, unknown>;
}

export class AccountCommissionHistoriesQueryDto extends PaginationDto {
  @Allow()
  @IsOptional()
  readonly date: Date;
}

export class ChangePhoneRequestDto {
  @IsPhoneNumber('VN', { message: VALIDATE_MESSAGE.ACCOUNT.PHONE_INVALID })
  readonly phone: string;
}
export class AccountCommissionConfirmRequestDto {
  @IsNotEmpty()
  @IsArray({ message: VALIDATE_MESSAGE.CONTACT.CONTACT_INVALID })
  readonly commissions: string[];
}

export class CheckReferralCodeQueryDto {
  @IsNotEmpty()
  readonly referralCode: string;
}

export class AccountRewardEventDto {
  readonly cbAvailable: number;

  readonly timeCurrent: number;

  readonly timeStart: number;

  readonly timeEnd: number;

  readonly reward: number;

  readonly time: number;

  readonly totalAmount: number;

  readonly totalPaid: number;

  readonly status: string;

  readonly eventId: string;
}

export class AccountRewardEventResponseDto extends CommonResponseDto {
  readonly data: AccountRewardEventDto;
}

export class EventQueryDto extends VersionQueryDto {
  @IsOptional()
  readonly eventId: string;
}

export class MyReferralRankingDto {
  referralRankingId: string;
  accountId: string;
}

export class ReferralRankingAccountsDto {
  referralRankingId: string;
}
