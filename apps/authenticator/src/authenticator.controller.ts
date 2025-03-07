import { MESSAGE_PATTERN } from '@app/common/constants';
import { Ack } from '@app/common/decorators/ack.decorator';
import {
  Account,
  Auth,
  BuySatoshiRequestDto,
  BuyVNDCRequestDto,
  ChangeEmailRequestDto,
  CheckPhoneRequestDto,
  ConfirmEmailRequestDto,
  FindAccountRequestDto,
  OTPRequestDto,
  ResetPasscodeRequestDto,
  SigninRequestDto,
  SignupRequestDto,
  SyncContactRequestDto,
  UpdateAccountSettingBodyDto,
  UserProfileRequestDto,
  VerifyOTPRequestDto,
  VersionQueryDto,
} from '@app/dto';
import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { AuthenticatorService } from './authenticator.service';
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

  @MessagePattern(MESSAGE_PATTERN.AUTH.CHECK_PHONE)
  async checkPhone(
    @Payload() body: CheckPhoneRequestDto & Auth,
    @Ack() _: RmqContext,
  ) {
    return this._service.checkPhone(body);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.PRE_CHECK_PHONE)
  async preCheckPhone(
    @Payload() body: CheckPhoneRequestDto & Auth,
    @Ack() _: RmqContext,
  ) {
    return this._service.preCheckPhone(body);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.RESET_PASSCODE)
  async resetPasscode(
    @Payload() body: ResetPasscodeRequestDto,
    @Ack() _: RmqContext,
  ) {
    return this._service.resetPasscode(body);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.SIGN_IN)
  async signIn(
    @Payload() body: SigninRequestDto,
    @Ack() _: RmqContext,
  ): Promise<Account> {
    return this._service.signIn(body.phone, body.passcode);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.EDIT_PROFILE)
  async editProfile(
    @Payload()
    { userId, ...account }: UserProfileRequestDto & { userId: string },
    @Ack() _: RmqContext,
  ) {
    return this._service.editAccount(account, userId);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.CHANGE_EMAIL)
  async changeEmail(
    @Payload()
    { input, userId }: { input: ChangeEmailRequestDto; userId: string },
    @Ack() _: RmqContext,
  ) {
    return this._service.changeEmail(input, userId);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.CONFIRM_EMAIL)
  async confirmEmail(
    @Payload()
    { input, userId }: { input: ConfirmEmailRequestDto; userId: string },
    @Ack() _: RmqContext,
  ) {
    return this._service.confirmEmail(input, userId);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.SYNC_CONTACT)
  syncContacts(
    @Payload() input: SyncContactRequestDto & { id: string },
    @Ack() _: RmqContext,
  ) {
    const { id, ...others } = input;
    return this._service.syncContacts(id, others);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.GET_CONTACT)
  getContacts(@Payload() id: string, @Ack() _: RmqContext) {
    return this._service.getContacts(id);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.UPDATE_ACCOUNT_SETTING)
  accountSetting(
    @Payload()
    { userId, body }: { userId: string; body: UpdateAccountSettingBodyDto },
    @Ack() _: RmqContext,
  ) {
    return this._service.updateAccountSetting(userId, body);
  }
}
