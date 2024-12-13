import { CB_EXCHANGE_TYPE, CURRENCY_CODE, EXCHANGE_METHOD } from '@app/common';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import {
  Allow,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { CommonResponseDto, VersionQueryDto } from '../common';
import { ApiProperty } from '@nestjs/swagger';

export class PayMeResponse {
  @Allow()
  @IsOptional()
  type: string;

  @Allow()
  @IsOptional()
  data: PayMeData;

  @Allow()
  @IsOptional()
  checksum: string;
}

export type PayMeData = {
  accountId: string;
  appId: number;
  transaction: string;
  partnerTransaction: string;
  storeId: string;
  amount: number;
  state: string;
  orderId: string;
};

export class KycIPNData {
  @IsUUID()
  @IsNotEmpty()
  merchantAccountId: string;

  @IsNotEmpty()
  state: string;

  @IsOptional()
  @IsString()
  connectState: string;

  @IsOptional()
  @IsString()
  fullname: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  gender: string;

  @IsOptional()
  accountId: string;

  @IsOptional()
  @IsString()
  type: string;
}

export class ExchangeCommonRequestDto {
  @IsString({ message: VALIDATE_MESSAGE.CASHBACK.COIN_INVALID })
  readonly currencyId: string;

  @IsNumber(undefined, { message: VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID })
  readonly amount: number;
}

export class ExchangeQueryInquiryDto extends ExchangeCommonRequestDto {
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID })
  readonly receiverInfo: string;
}

export class ExchangeQueryInquiryV2Dto extends ExchangeQueryInquiryDto {
  @IsEnum(CB_EXCHANGE_TYPE)
  readonly type: number;
}

export class ExchangeRequestV2Dto extends ExchangeQueryInquiryV2Dto {
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_INVALID })
  readonly token: string;
}

export class ExchangeV3InquiryDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID })
  readonly receiverInfo: string;

  @ApiProperty({ enum: EXCHANGE_METHOD })
  @IsEnum(EXCHANGE_METHOD)
  readonly method: EXCHANGE_METHOD;

  @ApiProperty({ enum: CURRENCY_CODE })
  @IsIn([CURRENCY_CODE.VNDC, CURRENCY_CODE.BBC])
  readonly currency: CURRENCY_CODE;

  @ApiProperty({ type: Number })
  @IsNumber(undefined, { message: VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID })
  readonly amount: number;
}

export class ExchangeV3VerifyPasscodeDto {
  @ApiProperty({ type: String })
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_INVALID })
  readonly token: string;

  @ApiProperty({ type: String })
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.PASSCODE_INVALID })
  readonly passcode: string;
}

export class ExchangeV3SubmitDto extends ExchangeV3InquiryDto {
  @ApiProperty({ type: String })
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_INVALID })
  readonly token: string;
}

export class ExchangeRequestDto extends ExchangeQueryInquiryDto {
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_INVALID })
  readonly token: string;
}

export class ExchangeRequestPasscodeDto {
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.PASSCODE_INVALID })
  readonly passcode: string;

  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_INVALID })
  readonly token: string;
}

export class ExchangeRequestOtpDto {
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.PASSCODE_INVALID })
  readonly otp: string;

  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_INVALID })
  readonly token: string;
}

export class ExchangeInquiryResponseDto {
  readonly amount: unknown;

  readonly fee: unknown;

  readonly currencyFrom: unknown;

  readonly currencyTo: unknown;

  readonly token: string;
}

export class ExchangeResponseDto {
  readonly id: string;

  readonly transId: string;

  readonly amount: unknown;

  readonly currencyFrom: unknown;

  readonly currencyTo: unknown;

  readonly status: number;

  readonly createdAt: string;
}

class CashbackResponseDto {
  readonly amount: number;

  readonly currencyId: string;

  readonly currency: string;

  readonly pending: unknown;
}

export class CashbackListResponseDto extends CommonResponseDto {
  readonly data: unknown;
}

export class CashbackMultipleCoinResponseDto extends CommonResponseDto {
  readonly data: unknown;
}

export class ExchangeRateResponseDto extends CommonResponseDto {
  readonly data: unknown;
}

export class InquiryQueryDto {
  @IsString({ message: VALIDATE_MESSAGE.CASHBACK.COIN_INVALID })
  readonly currencyId: string;

  @IsOptional()
  @IsPhoneNumber('VN', { message: VALIDATE_MESSAGE.ACCOUNT.PHONE_INVALID })
  readonly phone: string;

  @IsOptional()
  @IsEmail(undefined, { message: VALIDATE_MESSAGE.ACCOUNT.EMAIL_INVALID })
  readonly email: string;

  @IsOptional()
  @IsNumber(undefined, { message: VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID })
  readonly amount: number;
}

class CashbackInquiry {
  readonly amount: unknown;

  readonly fee: unknown;

  readonly receiver: unknown;

  readonly token: string;
}

export class CashbackInquiryResponseDto {
  readonly data: unknown;
}

export class OffChainPasscodeRequestDto extends ExchangeRequestPasscodeDto {}

export class OffChainOTPRequestDto extends ExchangeRequestOtpDto {}

class OffChainRequestCommon {
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID })
  readonly receiverId: string;

  @IsNumber(undefined, { message: VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID })
  readonly amount: number;

  @IsNumber(undefined, { message: VALIDATE_MESSAGE.CASHBACK.COIN_INVALID })
  readonly currencyId: string;
}
export class OffChainConfirmRequestDto extends OffChainRequestCommon {
  @IsOptional()
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_INVALID })
  readonly token: string;
}

export class OffChainTransferRequestDto extends OffChainRequestCommon {
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_INVALID })
  readonly token: string;
}

export class OffChainTransferResponseDto {
  readonly transId: string;

  readonly amount: unknown;

  readonly receiver: unknown;

  readonly createdAt: string;
}

// VNDC
export type VNDCSendOffChainBody = {
  account_receive: string;
  amount_send: string;
  coin: string;
};

export class BuyVNDCInquiryRequestDto {
  @ApiProperty({ type: String })
  @IsPhoneNumber('VN', { message: VALIDATE_MESSAGE.ACCOUNT.PHONE_INVALID })
  readonly vndcReceiver: string;

  @ApiProperty({ type: Number })
  @IsNumber(undefined, { message: VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID })
  readonly amount: number;
}

export class BuyVNDCInquiryResponseDto extends CommonResponseDto {
  readonly data: unknown;
}

export enum MethodType {
  PAY_ME = 1,
  CREDIT = 2,
  ATM = 3,
}

export class PaymeDepositDto {
  @IsNumber(undefined, { message: VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID })
  readonly amount: number;

  @IsIn([CURRENCY_CODE.VNDC], {
    message: VALIDATE_MESSAGE.CASHBACK.CURRENCY_INVALID,
  })
  readonly currency: CURRENCY_CODE;
}

export class BuySatoshiRequestDto {
  @ApiProperty({ type: Number })
  @IsNumber(undefined, { message: VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID })
  readonly amount: number;

  @ApiProperty({ type: Number })
  @IsNumber(undefined, { message: VALIDATE_MESSAGE.CASHBACK.METHOD_INVALID })
  @IsEnum(MethodType, { message: VALIDATE_MESSAGE.CASHBACK.METHOD_INVALID })
  readonly methodType: number;

  @ApiProperty({ type: Number })
  amountExchange: number;

  @ApiProperty({ type: String })
  storeId: string;
}

export class BuyVNDCRequestDto {
  @ApiProperty({ type: Number })
  @IsNumber(undefined, { message: VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID })
  readonly amount: number;

  @ApiProperty({ type: Number, enum: MethodType })
  @IsNumber(undefined, { message: VALIDATE_MESSAGE.CASHBACK.METHOD_INVALID })
  @IsEnum(MethodType, { message: VALIDATE_MESSAGE.CASHBACK.METHOD_INVALID })
  readonly methodType: number;

  @ApiProperty({ type: String })
  @IsString()
  storeId: string;
}

export class BuySatoshiResponseDto extends CommonResponseDto {
  readonly data: unknown;
}

export class PartnerTransactionPendingResponseDto {
  readonly data: Record<string, unknown>;
}

export class CoinListResponseDto extends CommonResponseDto {
  readonly data: unknown;
}

export class ExchangeCoinRequestDto extends VersionQueryDto {
  @IsPositive()
  @IsNumber(undefined, { message: VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID })
  readonly amount: number;

  @IsNotEmpty()
  @IsString()
  readonly fromCoin: string;

  @IsNotEmpty()
  @IsString()
  readonly toCoin: string;

  readonly userId: string;
}

export class ExchangeWalletsResponseDto extends CommonResponseDto {
  readonly data: unknown;
}

export class VNDCExchangeInquiryRequestDto extends VersionQueryDto {
  @IsNumber(undefined, { message: VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID })
  readonly amount: number;

  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID })
  readonly receiverInfo: string;

  accountId: string;

  currencyId: string;
}

export class VNDCExchangeRequestDto extends VNDCExchangeInquiryRequestDto {
  @IsString({ message: VALIDATE_MESSAGE.ACCOUNT.TOKEN_INVALID })
  readonly token: string;
}

export class TransferVndcRequestDto {
  @IsNotEmpty()
  @IsPositive()
  @IsNumber(undefined, { message: VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID })
  readonly amount: number;

  @IsNotEmpty()
  @IsString()
  readonly bank: string;

  @IsNotEmpty()
  @IsString()
  readonly sms: string;

  readonly userId: string;
}
