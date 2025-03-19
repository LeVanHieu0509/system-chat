import {
  KYC_STATUS,
  MainValidationPipe,
  PATH_CONTAIN_ID,
  RedlockMeta,
  Roles,
  RoleType,
} from '@app/common';
import { LockInterceptor } from '@app/common/interceptors/lock.interceptor';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import {
  AccountCommissionConfirmRequestDto,
  AccountCommissionHistoriesQueryDto,
  PaginationDto,
  TransactionCashbackQueryDto,
} from '@app/dto';
import { UtilsService } from '@app/utils';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthUser, RequestUser } from '../../dto';
import {
  AccountQueryDto,
  AccountRequestDto,
  AccountResetPasscodeDto,
  CashbackQueryDto,
  ReferralUsersQueryDto,
  SendNotificationQueryDto,
  SendNotificationRequestDto,
} from './account.dto';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
  constructor(private readonly _service: AccountService) {}

  @Roles(RoleType.MANAGER, RoleType.EDITOR)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Get(PATH_CONTAIN_ID + '/referral')
  async getReferrals(
    @Param('id') id: string,
    @Query() query: ReferralUsersQueryDto,
  ) {
    return this._service.getReferrals(id, query);
  }

  @Roles(RoleType.MANAGER, RoleType.EDITOR)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Get()
  async getAccounts(@Query() query: AccountQueryDto) {
    return this._service.getAccounts(query);
  }

  @Roles(RoleType.MANAGER)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Patch(PATH_CONTAIN_ID)
  async updateAccountStatus(
    @Body() body: AccountRequestDto,
    @Param('id') id: string,
    @Req() { user }: RequestUser,
  ) {
    if (Object.keys(body).length === 0) return { status: false };
    if ((body.status !== undefined || body.phone) && !body.reason)
      throw new BadRequestException([
        { field: 'reason', message: 'REASON_INVALID' },
      ]);
    if (body.phone)
      body.phone = UtilsService.getInstance().toIntlPhone(body.phone);
    return this._service.updateAccount(id, user['id'], body);
  }

  @Roles(RoleType.MANAGER, RoleType.EDITOR)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Get(PATH_CONTAIN_ID)
  async getAccount(@Param('id') id: string) {
    return this._service.getAccount(id);
  }

  @Roles(RoleType.MANAGER, RoleType.EDITOR)
  @UsePipes(new MainValidationPipe())
  @Get(PATH_CONTAIN_ID + '/cashback-transaction')
  async getCashbackTransactions(
    @Query() query: TransactionCashbackQueryDto,
    @Param('id') id: string,
  ) {
    return this._service.getCashbackTrans(id, query);
  }

  @Roles(RoleType.MANAGER, RoleType.EDITOR)
  @UsePipes(new MainValidationPipe())
  @Get(PATH_CONTAIN_ID + '/notification')
  async getNotifications(
    @Query() query: PaginationDto,
    @Param('id') id: string,
  ) {
    return this._service.getNotifications(id, query);
  }

  @Roles(RoleType.MANAGER, RoleType.EDITOR)
  @UsePipes(new MainValidationPipe())
  @Post(PATH_CONTAIN_ID + '/reset-passcode')
  async resetPasscode(
    @Body() body: AccountResetPasscodeDto,
    @Param('id') id: string,
    @Req() { user }: RequestUser,
  ) {
    return this._service.resetPasscode(id, user['id'], body);
  }

  @Roles(RoleType.MANAGER, RoleType.EDITOR)
  @UsePipes(new MainValidationPipe())
  @Get(PATH_CONTAIN_ID + '/cashback-wallet')
  async getCashbackWallet(
    @Param('id') id: string,
    @Query() query: CashbackQueryDto,
  ) {
    return this._service.getCashbackWalletById(id, query);
  }

  @Roles(RoleType.MANAGER, RoleType.EDITOR)
  @UsePipes(new MainValidationPipe())
  @Get(PATH_CONTAIN_ID + '/wallet-info')
  async getWalletInfo(@Param('id') id: string) {
    return this._service.getWalletInfoById(id);
  }

  @Roles(RoleType.MANAGER, RoleType.EDITOR)
  @UsePipes(new MainValidationPipe())
  @Patch(PATH_CONTAIN_ID + '/upgrade-partner')
  async upgradePartnerUser(
    @Param('id') id: string,
    @Req() { user }: RequestUser,
  ) {
    return this._service.upgradePartnerUser(id, user['id']);
  }

  @Roles(RoleType.MANAGER, RoleType.EDITOR)
  @UsePipes(new MainValidationPipe())
  @Get(PATH_CONTAIN_ID + '/commission')
  async getCommissionHistories(
    @Param('id') id: string,
    @Query() query: AccountCommissionHistoriesQueryDto,
  ) {
    return this._service.getCommissionHistories(id, query);
  }

  @Roles(RoleType.MANAGER)
  @RedlockMeta({
    key: 'APPROVED_COMMISSION',
    uuid: false,
    error: new BadRequestException([
      { field: 'id', message: VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID },
    ]),
  })
  @UseInterceptors(LockInterceptor)
  @UsePipes(new MainValidationPipe())
  @Post(PATH_CONTAIN_ID + '/commission')
  async approvedCommissionForPartner(
    @Param('id') id: string,
    @Body() { commissions }: AccountCommissionConfirmRequestDto,
    @Req() { user }: RequestUser,
  ) {
    return this._service.approvedCommissionForPartner(
      id,
      commissions,
      user as AuthUser,
    );
  }

  @Roles(RoleType.MANAGER, RoleType.EDITOR)
  @UsePipes(new MainValidationPipe())
  @Post('send-notification')
  async sendNotificationForAccount(
    @Body() body: SendNotificationRequestDto,
    @Query() query: SendNotificationQueryDto,
  ) {
    return this._service.sendNotificationForAccount(body, query);
  }

  @Roles(RoleType.MANAGER)
  @Patch(PATH_CONTAIN_ID + '/kyc')
  async updateKyc(@Param('id') id: string) {
    return this._service.changeKycStatus(id, KYC_STATUS.APPROVED);
  }
}
