import { MESSAGE_PATTERN } from '@app/common/constants';
import { Ack } from '@app/common/decorators/ack.decorator';
import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import {
  Account,
  Auth,
  BuySatoshiRequestDto,
  FindAccountRequestDto,
  OTPRequestDto,
  SignupRequestDto,
  VerifyOTPRequestDto,
  VersionQueryDto,
} from '@app/dto';
import { AuthenticatorService } from './authenticator.service';
import { BuyVNDCRequestDto } from '@app/dto';
import { PartnerService } from './partner.service';

@Controller()
export class AuthenticatorController {
  constructor(
    private readonly _service: AuthenticatorService,
    private readonly _partnerService: PartnerService,
  ) {}

  @Get()
  getHello(): string {
    return this._service.getHello();
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.REQUEST_OTP)
  async requestOTP(@Payload() body: OTPRequestDto, @Ack() _: RmqContext) {
    return this._service.processOTP(body);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.VERIFY_OTP)
  async verifyOTP(@Payload() body: VerifyOTPRequestDto, @Ack() _: RmqContext) {
    return this._service.checkOTP(body);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.FIND_ACCOUNT)
  async findAccount(
    @Payload() params: FindAccountRequestDto,
    @Ack() _: RmqContext,
  ) {
    return this._service.getAccount(params);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.SIGN_UP)
  async signup(@Payload() input: Account, @Ack() _: RmqContext) {
    return this._service.saveAccount(input);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.SIGN_IN_WITH_GOOGLE)
  async signInWithGoogle(@Payload() accessToken: string, @Ack() _: RmqContext) {
    return this._service.signInWithGoogle(accessToken);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.SIGN_UP_VERIFY_PASSCODE)
  async verifyPasscodeSignUp(
    @Payload() body: SignupRequestDto,
    @Ack() _: RmqContext,
  ) {
    return this._service.validateSignUp(body);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.SIGN_IN_VERIFY_PASSCODE)
  async verifyPasscodeSignIn(
    @Payload() { id, passcode }: { id: string; passcode: string },
    @Ack() _: RmqContext,
  ) {
    return this._service.verifyPasscodeSignIn(id, passcode);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.GET_PROFILE)
  async getProfile(
    @Payload() id: string,
    @Ack() _: RmqContext,
  ): Promise<Account> {
    const account = await this._service.getAccount({ id }, true);
    delete account.passcode;
    return account;
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.SAVE_NEW_ACCOUNT)
  async saveAccount(@Payload() input: Account, @Ack() _: RmqContext) {
    return this._service.saveAccount(input);
  }

  // --------------------------------------- PARTNER -------------------------------------------//
  @MessagePattern(MESSAGE_PATTERN.VNDC.CREATE_BUY_VNDC_TRANSACTION)
  createBuyVNDCOrder(
    @Payload() input: BuyVNDCRequestDto & { accountId: string },
    @Ack() _: RmqContext,
  ) {
    return this._partnerService.createBuyVNDCTransaction(input);
  }

  @MessagePattern(MESSAGE_PATTERN.VNDC.CANCEL_TRANSACTION)
  cancelTransaction(@Payload() orderId: string, @Ack() _: RmqContext) {
    return this._partnerService.cancelTransactionById(orderId);
  }

  @MessagePattern(MESSAGE_PATTERN.VNDC.UPDATE_STATUS_TRANSACTION)
  updateStatusTransaction(
    @Payload() { orderId, accountId }: { orderId: string; accountId: string },
    @Ack() _: RmqContext,
  ) {
    return this._partnerService.updateStatusTransaction(accountId, orderId);
  }

  @MessagePattern(MESSAGE_PATTERN.VNDC.GET_TRANSACTION)
  getPartnerTransactions(
    @Payload() input: VersionQueryDto & Auth,
    @Ack() _: RmqContext,
  ) {
    return this._partnerService.getTransactionByAccountId(input);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.CHANGE_PHONE)
  async changePhone(
    @Payload() { phone, userId }: { phone: string; userId: string },
    @Ack() _: RmqContext,
  ) {
    return this._service.changePhone(phone, userId);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.CONFIRM_PHONE)
  async confirmPhone(@Payload() userId: string, @Ack() _: RmqContext) {
    return this._service.confirmPhone(userId);
  }

  @MessagePattern(MESSAGE_PATTERN.VNDC.BUY_SATOSHI)
  async createTransactionForBuyingSatoshi(
    @Payload() input: BuySatoshiRequestDto & { accountId: string },
    @Ack() _: RmqContext,
  ) {
    return this._partnerService.createTransactionForBuyingSatoshi(input);
  }
}
