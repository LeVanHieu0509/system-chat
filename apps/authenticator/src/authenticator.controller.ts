import { MESSAGE_PATTERN } from '@app/common/constants';
import { Ack } from '@app/common/decorators/ack.decorator';
import {
  Account,
  AccountCommissionHistoriesQueryDto,
  Auth,
  BuySatoshiRequestDto,
  BuyVNDCRequestDto,
  ChangeEmailRequestDto,
  CheckPhoneRequestDto,
  ConfirmEmailRequestDto,
  FindAccountRequestDto,
  OTPRequestDto,
  PaginationDto,
  ReferralQueryDto,
  ResetPasscodeRequestDto,
  SettingAccountRequestDto,
  SigninRequestDto,
  SignupRequestDto,
  SyncContactRequestDto,
  TransactionHistoryQueryDto,
  UpdateAccountSettingBodyDto,
  UpdateDeviceTokenRequestDto,
  UserProfileRequestDto,
  VerifyOTPRequestDto,
  VersionQueryDto,
} from '@app/dto';
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { AuthenticatorService } from './authenticator.service';
import { PartnerService } from './partner.service';
import { ExecutionTimeLoggerInterceptor } from '@app/common/interceptors/execution-time-logger.interceptor';

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

  @MessagePattern(MESSAGE_PATTERN.AUTH.SIGN_IN)
  async signIn(
    @Payload() body: SigninRequestDto,
    @Ack() _: RmqContext,
  ): Promise<Account> {
    return this._service.signIn(body.phone, body.passcode);
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

  // ------------------------------ PHONE - OTP ---------------------------------- //
  @MessagePattern(MESSAGE_PATTERN.AUTH.REQUEST_OTP)
  async requestOTP(@Payload() body: OTPRequestDto, @Ack() _: RmqContext) {
    return this._service.processOTP(body);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.VERIFY_OTP)
  async verifyOTP(@Payload() body: VerifyOTPRequestDto, @Ack() _: RmqContext) {
    return this._service.checkOTP(body);
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

  @MessagePattern(MESSAGE_PATTERN.AUTH.RESET_PASSCODE)
  async resetPasscode(
    @Payload() body: ResetPasscodeRequestDto,
    @Ack() _: RmqContext,
  ) {
    return this._service.resetPasscode(body);
  }

  // ------------------------------ EMAIL ---------------------------------- //
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

  // ------------------------------ CONTACT ---------------------------------- //
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

  // ------------------------------ PROFILE ---------------------------------- //

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

  @MessagePattern(MESSAGE_PATTERN.AUTH.PROFILE_SETTING)
  settingProfile(
    @Payload()
    {
      id,
      receiveNotify,
      userId,
    }: SettingAccountRequestDto & { id: string; userId: string },
    @Ack() _: RmqContext,
  ) {
    return this._service.settingProfile(userId, id, receiveNotify);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.EDIT_PROFILE)
  async editProfile(
    @Payload()
    { userId, ...account }: UserProfileRequestDto & { userId: string },
    @Ack() _: RmqContext,
  ) {
    return this._service.editAccount(account, userId);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.UPDATE_ACCOUNT_SETTING)
  accountSetting(
    @Payload()
    { userId, body }: { userId: string; body: UpdateAccountSettingBodyDto },
    @Ack() _: RmqContext,
  ) {
    return this._service.updateAccountSetting(userId, body);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.DEVICE_TOKEN)
  updateDeviceToken(
    @Payload()
    { id, deviceToken }: UpdateDeviceTokenRequestDto & { id: string },
    @Ack() _: RmqContext,
  ) {
    return this._service.updateDeviceToken(id, deviceToken);
  }

  // ------------------------------ TRANSACTION ---------------------------------- //
  @MessagePattern(MESSAGE_PATTERN.AUTH.TRANS_HISTORY)
  async getTransactionHistory(
    @Payload() { id, ...others }: TransactionHistoryQueryDto & { id: string },
    @Ack() _: RmqContext,
  ) {
    return this._service.getTransactionHistory(id, others);
  }

  @MessagePattern(MESSAGE_PATTERN.VNDC.BUY_SATOSHI)
  async createTransactionForBuyingSatoshi(
    @Payload() input: BuySatoshiRequestDto & { accountId: string },
    @Ack() _: RmqContext,
  ) {
    return this._partnerService.createTransactionForBuyingSatoshi(input);
  }

  // ------------------------------ NOTIFICATION ---------------------------------- //

  @UseInterceptors(ExecutionTimeLoggerInterceptor)
  @MessagePattern(MESSAGE_PATTERN.AUTH.NOTIFICATION)
  getNotification(
    @Payload() { userId, ...query }: { userId: string } & PaginationDto,
    @Ack() _: RmqContext,
  ) {
    return this._service.getNotification(query, userId);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.SEEN_NOTIFICATION)
  updateSeenNotification(
    @Payload() { id, userId }: { id: string; userId: string },
    @Ack() _: RmqContext,
  ) {
    return this._service.updateSeenNotification(id, userId);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.COUNT_NOTIFICATION)
  countUnreadNotification(@Payload() userId: string, @Ack() _: RmqContext) {
    return this._service.countNotification(userId);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.READ_ALL_NOTIFICATIONS)
  readAllNotifications(
    @Payload() input: { userId: string; at: Date },
    @Ack() _: RmqContext,
  ) {
    return this._service.readAllNotifications(input.userId, input.at);
  }

  // ------------------------------ BANNER ---------------------------------- //

  @MessagePattern(MESSAGE_PATTERN.AUTH.BANNERS_V2)
  getBannersV2(@Ack() _: RmqContext) {
    return this._service.getBannersV2();
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.ADS_BANNER)
  getAdsBanner(@Ack() _: RmqContext) {
    return this._service.getAdsBanner();
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.ADS_BANNER_V2)
  getAdsBannerV2(@Ack() _: RmqContext) {
    return this._service.getAdsBannerV2();
  }

  // ------------------------------ REFERRALS ---------------------------------- //
  @MessagePattern(MESSAGE_PATTERN.AUTH.GET_REFERRAL_BY_ACCOUNT)
  getReferrals(
    @Payload() { id, input }: { id: string; input: ReferralQueryDto },
    @Ack() _: RmqContext,
  ) {
    return this._service.getReferrals(id, input);
  }

  // ------------------------------ PARTNER ---------------------------------- //
  @MessagePattern(MESSAGE_PATTERN.AUTH.GET_TOTAL_COMMISSION)
  getTotalCommission(@Payload() accountId: string, @Ack() _: RmqContext) {
    return this._partnerService.getTotalCommission(accountId);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.GET_COMMISSION_HISTORIES_V2)
  getCommissionHistories(
    @Payload()
    { id, query }: { query: AccountCommissionHistoriesQueryDto; id: string },
    @Ack() _: RmqContext,
  ) {
    return this._partnerService.getCommissionHistoriesV2(id, query);
  }

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
}
