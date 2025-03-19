import { Prisma, PrismaPromise } from '.prisma/client';
import { CachingService } from '@app/caching';
import {
  CASHBACK_ACTION_TYPE,
  CASHBACK_STATUS,
  CASHBACK_TYPE,
  COMMISSION_RATE,
  CURRENCY_CODE,
  KYC_STATUS,
  MAX_CONNECTION_POOL,
  MAX_QUOTA_DEVICE_TOKEN,
  MESSAGE_PATTERN,
  NOTIFICATION_TYPE,
  QUEUES,
  STATUS,
} from '@app/common';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import {
  AccountCommissionHistoriesQueryDto,
  PaginationDto,
  TransactionCashbackQueryDto,
} from '@app/dto';
import { MailService } from '@app/mail';
import {
  COMMON_NOTE_STATUS,
  COMMON_TITLE,
  NOTIFY_DESCRIPTION,
} from '@app/notification';
import { NotificationV2Service } from '@app/notification/notification-v2.service';
import { UtilsService } from '@app/utils';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { isHexadecimal, isPhoneNumber } from 'class-validator';
import { readFileSync } from 'fs';
import { ACCOUNT_DEFAULT_PASSCODE } from 'libs/config';
import { join } from 'path';
import { AuthUser } from '../../dto';
import {
  AccountQueryDto,
  AccountRequestDto,
  AccountResetPasscodeDto,
  CashbackQueryDto,
  ReferralUsersQueryDto,
  SendNotificationQueryDto,
  SendNotificationRequestDto,
} from './account.dto';
import { MainRepo } from '@app/repositories/main.repo';
import { VNDCService } from 'libs/plugins';
import { buildAccountFilter, getActiveTokens } from '../share';

@Injectable()
export class AccountService {
  private readonly _logger = new Logger('AccountService');
  private readonly _sqlGetAccounts: string;
  private readonly _sqlGetAccountFields: string;
  private readonly _sqlGetAccountsRef: string;
  private readonly _sqlTotalAccountsRef: string;

  constructor(
    @Inject(QUEUES.WALLET) private readonly _clientWallet: ClientProxy,
    private readonly _repo: MainRepo,
    private readonly _vndc: VNDCService,
    private readonly _notification: NotificationV2Service,
  ) {
    _repo.setServiceName('CMS');
    this._sqlGetAccounts = readFileSync(
      join(process.cwd(), 'sql/find-account-from-cms.sql'),
    ).toString();
    this._sqlGetAccountFields = readFileSync(
      join(process.cwd(), 'sql/find-account-from-cms-select-fields.sql'),
    ).toString();
    this._sqlTotalAccountsRef = readFileSync(
      join(process.cwd(), 'sql/count-account-referral-from-cms.sql'),
    ).toString();
    this._sqlGetAccountsRef = readFileSync(
      join(process.cwd(), 'sql/find-account-referral-from-cms.sql'),
    ).toString();
  }

  async changeKycStatus(id: string, kycStatus: number) {
    this._logger.debug(`changeKycStatus id: ${id} kycStatus: ${kycStatus}`);

    const [account, accountReferral] = await Promise.all([
      this._repo.getAccount().findUnique({
        where: { id },
        select: {
          kycStatus: true,
          deviceToken: true,
          fullName: true,
          histories: true,
        },
      }),
      this._repo.getAccountReferral().findFirst({
        where: { referralFrom: id },
        select: { referralBy: true },
      }),
    ]);

    if (
      !account ||
      account.kycStatus === kycStatus ||
      account.kycStatus === KYC_STATUS.APPROVED
    ) {
      throw new BadRequestException([
        {
          field: 'kycStatus',
          message: VALIDATE_MESSAGE.ACCOUNT.KYC_STATUS_INVALID,
        },
      ]);
    }

    const bulkOps: PrismaPromise<any>[] = [];
    const description = NOTIFY_DESCRIPTION.KYC[kycStatus];
    const { histories: accountHistories } = account;
    const { histories = [] } =
      (accountHistories as { histories: Record<string, unknown>[] }) || {};
    histories.push({
      updatedAt: new Date().toISOString(),
      reason: 'Cập nhập trạng thái eKYC.',
    });

    const data: Prisma.AccountUncheckedUpdateInput = {
      histories: account.histories,
      kycStatus,
    };

    if (kycStatus === KYC_STATUS.APPROVED) {
      data.kycApprovalAt = new Date().toISOString();
      await this.processCashbackForAccount(id, account.fullName);
      if (accountReferral) {
        bulkOps.push(
          this._repo.getAccountReferralStats().update({
            where: { accountId: accountReferral.referralBy },
            data: { totalKyc: { increment: 1 } },
            select: { updatedAt: true },
          }),
        );
      }
    }

    bulkOps.push(
      this._repo.getNotification().create({
        data: {
          type: NOTIFICATION_TYPE.KYC,
          description,
          title: COMMON_TITLE.KYC,
          accountId: id,
        },
      }),
      this._repo
        .getAccount()
        .update({ where: { id }, data, select: { updatedAt: true } }),
    );
    await this._repo.transaction(bulkOps);
    if (account.deviceToken)
      this._notification.sendNotifyKYCSuccess([id], description);

    return { status: true };
  }

  async getAccounts(query: AccountQueryDto) {
    const pagination = this._repo.getPagination(query.page, query.size);
    const tokens = await getActiveTokens(this._repo.getCurrency());

    const { orderBy, tokenFields, tokenJoin, values, whereClause } =
      buildAccountFilter(query, tokens);

    const sqlTotal = this._sqlGetAccounts
      .replace('$fields', 'count(*)')
      .replace('$tokenJoin', tokenJoin)
      .replace('$where', whereClause)
      .replace('$order', '')
      .replace('$paging', '');
    const sqlGetAccounts = this._sqlGetAccounts
      .replace(
        '$fields',
        this._sqlGetAccountFields.replace('$token', tokenFields),
      )
      .replace('$tokenJoin', tokenJoin)
      .replace('$where', whereClause)
      .replace('$order', `order by ${orderBy}`)
      .replace(
        '$paging',
        `limit $${values.length + 1} offset $${values.length + 2}`,
      );

    const [totalRecords, data] = await Promise.all([
      this._repo.sql<{ count: number }[]>(sqlTotal, values),
      this._repo.sql<unknown[]>(sqlGetAccounts, [
        ...values,
        pagination.take,
        pagination.skip,
      ]),
    ]);

    data.forEach((d) => {
      d['tokens'] = tokens.reduce((prev, { code }) => {
        const amount = Math.floor(d[`totalAmount${code}`]);
        d[`totalAmount${code}`] = undefined;
        return { ...prev, [code]: amount };
      }, {});
    });
    return { page: pagination.page, totalRecords: totalRecords[0].count, data };
  }

  async getReferrals(id: string, query: ReferralUsersQueryDto) {
    const { page, size, keyword, from, to, kycStatus } = query;
    const pagination = this._repo.getPagination(page, size);
    const fromDate = from && new Date(from);
    const toDate = to && new Date(to);
    const values: any[] = [pagination.take, pagination.skip, id];
    const valuesTotal: any[] = [pagination.take, 0, id];
    const whereClauses = [''];

    if (keyword) {
      if (isPhoneNumber(keyword, 'VN')) {
        const phone = UtilsService.getInstance().toIntlPhone(keyword);
        values.push(phone);
        valuesTotal.push(phone);
        whereClauses.push(`a."phone" = $${values.length}`);
      } else {
        values.push(`%${keyword}%`);
        valuesTotal.push(`%${keyword}%`);
        let whereClause = `( a."referral_code" ilike $4 or a."email" ilike $4 or a."phone" ilike $4 or a."full_name" ilike $4)`;
        if (isHexadecimal(keyword))
          whereClause = whereClause.replace(
            ')',
            ` or a.id::text ilike $${values.length})`,
          );
        whereClauses.push(whereClause);
      }
    }
    if (kycStatus !== undefined) {
      values.push(kycStatus);
      valuesTotal.push(kycStatus);
      whereClauses.push(`a.kyc_status = $${values.length}`);
    }

    fromDate &&
      whereClauses.push(`a.created_at >= '${fromDate.toISOString()}'`);
    toDate && whereClauses.push(`a.created_at <= '${toDate.toISOString()}'`);

    const whereClause = whereClauses.join(' and ');

    const sqlTotal = this._sqlTotalAccountsRef.replace(
      '1 = 1',
      '1 = 1 ' + whereClause,
    );
    const sqlGetAccounts = this._sqlGetAccountsRef.replace(
      '1 = 1',
      '1 = 1 ' + whereClause,
    );
    const sqlTotalKyc =
      kycStatus === undefined || kycStatus === KYC_STATUS.APPROVED
        ? sqlTotal.replace(
            '1 = 1',
            '1 = 1 ' + ` and a.kyc_status = $${valuesTotal.length + 1}`,
          )
        : sqlTotal;

    const queries = [
      this._repo.sql(sqlTotal, valuesTotal),
      this._repo.sql(sqlGetAccounts, values),
    ];

    if (kycStatus === undefined || kycStatus === KYC_STATUS.APPROVED) {
      queries.push(
        this._repo.sql(sqlTotalKyc, [...valuesTotal, KYC_STATUS.APPROVED]),
      );
    }

    const [totalRecords, data, totalKyc] = await Promise.all(queries);

    return {
      data,
      totalRecords: totalRecords[0].count,
      page: pagination.page,
      totalKyc: totalKyc ? totalKyc[0].count : 0,
    };
  }

  async updateAccount(
    id: string,
    userId: string,
    { phone, status, reason }: AccountRequestDto,
  ) {
    this._logger.log(
      `updateAccount accountId: ${id} status: ${status} phone: ${phone}`,
    );
    const account = await this._repo.getAccount().findFirst({
      where: { OR: [{ id }, { phone }] },
      select: { id: true, status: true, phone: true, histories: true },
    });
    if (!account) {
      throw new BadRequestException([
        { field: 'id', message: VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID },
      ]);
    }
    if (status === account.status) {
      throw new BadRequestException([
        { field: 'status', message: VALIDATE_MESSAGE.ACCOUNT.STATUS_INVALID },
      ]);
    }
    if (phone === account.phone) {
      throw new BadRequestException([
        { field: 'phone', message: VALIDATE_MESSAGE.ACCOUNT.PHONE_EXIST },
      ]);
    }

    if (status === STATUS.INACTIVE) {
      CachingService.getInstance().delete(`BITBACK-${account.id}`);
      CachingService.getInstance().delete(`BITBACK-REFRESH-${account.id}`);
    }
    const { histories: accountHistories } = account;
    const { histories = [] } =
      (accountHistories as { histories: Record<string, unknown>[] }) || {};
    histories.push({
      reason,
      updatedById: userId,
      updatedAt: new Date().toISOString(),
    });

    await this._repo.transaction([
      this._repo.getAccount().update({
        where: { id },
        data: { status, phone, histories: account.histories },
      }),
    ]);

    return { status: true };
  }

  async getAccount(id: string) {
    const account = await this._repo.getAccount().findUnique({
      where: { id },
      select: {
        id: true,
        avatar: true,
        fullName: true,
        status: true,
        phone: true,
        email: true,
        googleId: true,
        facebookId: true,
        appleId: true,
        kycStatus: true,
        deviceToken: true,
        referralCode: true,
        referralLink: true,
        isPartner: true,
        createdAt: true,
        updatedAt: true,
        accountReferralFrom: {
          select: {
            referralByInfo: {
              select: { id: true, fullName: true, isPartner: true },
            },
          },
        },
      },
    });

    if (!account) {
      throw new BadRequestException([
        { field: 'id', message: VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID },
      ]);
    }
    Object.assign(account, {
      parent: account.accountReferralFrom?.referralByInfo,
    });
    account.accountReferralFrom = undefined;
    return account;
  }

  async getCashbackTrans(
    accountId: string,
    { page, size, status, currency }: TransactionCashbackQueryDto,
  ) {
    await this.validateAccount(accountId);

    const pagination = this._repo.getPagination(page, size);
    const where: Prisma.CashbackTransactionWhereInput = {
      receiverId: accountId,
      status,
      type: CASHBACK_TYPE.PAYMENT,
      accessTradeId: { not: null },
    };
    if (currency) where.currency = { code: currency };

    const [totalRecords, trans] = await Promise.all([
      this._repo.getCbTrans().count({ where }),
      this._repo.getCbTrans().findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        select: {
          fee: true,
          type: true,
          amount: true,
          status: true,
          title: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          currency: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    trans.forEach((t) => {
      if (t.type === CASHBACK_TYPE.REFERRAL && !t.description)
        t.description = 'Giới thiệu ứng dụng Bitback';
      t.amount = t.amount.floor();
    });
    const data = UtilsService.getInstance().convertDataCurrency(trans, '');

    return { page: pagination.page, totalRecords, data };
  }

  async getNotifications(accountId: string, { page, size }: PaginationDto) {
    await this.validateAccount(accountId);

    const pagination = this._repo.getPagination(page, size);
    const [totalRecords, notifications] = await Promise.all([
      this._repo.getNotification().count({ where: { accountId } }),
      this._repo.getNotification().findMany({
        where: { accountId },
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { page: pagination.page, totalRecords, data: notifications };
  }

  async resetPasscode(
    id: string,
    updatedById: string,
    body: AccountResetPasscodeDto,
  ) {
    const account = await this._repo.getAccount().findFirst({
      where: { id, status: STATUS.ACTIVE },
      select: { histories: true },
    });
    if (!account) {
      throw new BadRequestException([
        { field: 'id', message: VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID },
      ]);
    }

    let passcode = '';
    if (body.passcode) {
      try {
        passcode = UtilsService.getInstance().decryptPasscode(body.passcode);
      } catch (err) {
        throw new BadRequestException([
          {
            field: 'passcode',
            message: VALIDATE_MESSAGE.ACCOUNT.PASSCODE_INVALID,
          },
        ]);
      }
    } else {
      passcode = ACCOUNT_DEFAULT_PASSCODE;
    }

    const passcodeMd5Hashed = UtilsService.getInstance().md5Hash(passcode);

    const { histories: accountHistories } = account;
    const { histories = [] } =
      (accountHistories as { histories: Record<string, unknown>[] }) || {};
    histories.push({
      reason: 'Đặt lại mật khẩu.',
      updatedById,
      updatedAt: new Date().toISOString(),
    });
    const { email } = await this._repo.getAccount().update({
      where: { id },
      data: {
        passcode: UtilsService.getInstance().hashValue(passcodeMd5Hashed),
        histories: account.histories,
      },
      select: { email: true },
    });

    if (email) {
      MailService.getInstance().sendResetPasscode(email, passcode);
    }
    return { status: true };
  }

  private async validateAccount(id: string) {
    const account = await this._repo.getAccount().count({ where: { id } });
    if (!account) {
      throw new BadRequestException([
        { field: 'id', message: VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID },
      ]);
    }
  }

  async getCashbackWalletById(id: string, input: CashbackQueryDto) {
    const { page, size, currency = CURRENCY_CODE.SATOSHI } = input;
    const pagination = this._repo.getPagination(page, size);
    const [totalRecords, data] = await Promise.all([
      this._repo
        .getCbTrans()
        .count({ where: { receiverId: id, currency: { code: currency } } }),
      this._repo
        .getCbTrans()
        .findMany({
          where: { receiverId: id, currency: { code: currency } },
          skip: pagination.skip,
          take: pagination.take,
          select: {
            id: true,
            type: true,
            status: true,
            amount: true,
            createdAt: true,
            title: true,
            description: true,
            actionType: true,
            currency: { select: { name: true, code: true } },
            sender: { select: { id: true, phone: true, fullName: true } },
          },
          orderBy: { createdAt: 'desc' },
        })
        .then((transactions) =>
          transactions.map((transaction) => ({
            ...transaction,
            amount: transaction.amount.floor(),
          })),
        ),
    ]);
    return { page, size, totalRecords, data };
  }

  async getWalletInfoById(id: string) {
    const pendingTransactionStatuses = [
      CASHBACK_STATUS.APPROVED,
      CASHBACK_STATUS.PROCESSING,
    ];
    const results = await this._repo.sql<
      { code: CURRENCY_CODE; amountAvailable: number; amountPending: number }[]
    >(
      `select
                cm.code,
                floor(coalesce(ca.amount, 0)) "amountAvailable",
                floor(coalesce(sum(ct.amount), 0)) "amountPending"
            from
                currency_master cm
            left join cashback_available ca on
                ca.currency_id = cm.id
                and ca.account_id = $1::uuid
            left join cashback_transaction ct on
                ct.receiver_id = ca.account_id
                and ct.currency_id = ca.currency_id
                and ct.status in (${pendingTransactionStatuses.join(',')})
            where
                cm.status = $2
            group by cm.id, ca.id;`,
      [id, STATUS.ACTIVE],
    );

    return results.reduce(
      (prev, { code, amountAvailable, amountPending }) => ({
        ...prev,
        [code]: { amountAvailable, amountPending },
      }),
      {},
    );
  }

  async upgradePartnerUser(id: string, updatedById: any) {
    const account = await this._repo.getAccount().findFirst({
      where: { id, isPartner: false },
      select: { histories: true },
    });
    if (!account)
      throw new BadRequestException([
        { field: 'id', message: VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID },
      ]);

    const { histories: accountHistories } = account;
    const { histories = [] } =
      (accountHistories as { histories: Record<string, unknown>[] }) || {};
    histories.push({
      reason: COMMON_NOTE_STATUS.UPGRADE_ACCOUNT,
      updatedById,
      updatedAt: new Date().toISOString(),
    });
    await this._repo.getAccount().update({
      where: { id },
      data: {
        isPartner: true,
        histories: account.histories,
        accountHistory: {
          create: {
            createdId: updatedById,
            reason: COMMON_NOTE_STATUS.UPGRADE_ACCOUNT,
          },
        },
      },
    });
    return { status: true };
  }

  async getCommissionHistories(
    accountId: string,
    { date, page, size }: AccountCommissionHistoriesQueryDto,
  ) {
    this._logger.log(
      `getCommissionHistories accountId: ${accountId} Date: ${date}`,
    );
    const account = await this._repo
      .getAccount()
      .count({ where: { id: accountId, isPartner: true } });
    if (!account) {
      throw new BadRequestException([
        { field: 'account', message: VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID },
      ]);
    }

    const dateFrom = new Date(date ? date : Date.now());
    dateFrom.setDate(1);
    dateFrom.setUTCHours(0, 0, 0, 0);

    const where = { accountId, transaction: { createdAt: { gte: dateFrom } } };
    if (date) {
      where.transaction.createdAt['lte'] = new Date(
        Date.UTC(
          dateFrom.getFullYear(),
          dateFrom.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        ),
      );
    }

    const pagination = this._repo.getPagination(page, size);
    const [commission, commissionHistories] = await Promise.all([
      this._repo
        .getAccountPartnerCommission()
        .aggregate({ _count: { id: true }, _sum: { commission: true }, where }),
      this._repo.getAccountPartnerCommission().findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        select: {
          id: true,
          totalValue: true,
          commission: true,
          isApproved: true,
          transaction: {
            select: {
              id: true,
              status: true,
              accessTradeId: true,
              createdAt: true,
              receiver: { select: { id: true, fullName: true } },
            },
          },
        },
      }),
    ]);

    const totalCommission = commission._sum.commission || 0;
    const totalReward =
      UtilsService.getInstance().calculateCommission(totalCommission);
    return {
      page,
      totalRecords: commission._count.id,
      data: { totalCommission, totalReward, commissionHistories },
    };
  }

  async approvedCommissionForPartner(
    accountId: string,
    ids: string[],
    user: AuthUser,
  ) {
    this._logger.log(
      `approvedCommissionForPartner accountId: ${accountId} ids: ${ids}`,
    );

    const account = await this._repo.getAccount().findFirst({
      where: { id: accountId, isPartner: true },
      select: { deviceToken: true },
    });
    if (!account) {
      throw new BadRequestException([
        { field: 'account', message: VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID },
      ]);
    }

    const commissions = await this._repo
      .getAccountPartnerCommission()
      .findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          accountId: true,
          commission: true,
          isApproved: true,
          transaction: { select: { id: true, status: true } },
        },
      });
    const commissionInvalid = commissions.some(
      (c) =>
        c.accountId !== accountId ||
        c.isApproved ||
        c.transaction.status !== CASHBACK_STATUS.SUCCESS,
    );
    if (commissionInvalid) {
      throw new BadRequestException([
        {
          field: 'commissions',
          message: VALIDATE_MESSAGE.ACCOUNT.COMMISSION_INVALID,
        },
      ]);
    }
    const exchangeRate = await this._vndc.getExchangeRate();
    const cbAvailable = await this._repo.getCbAvailable().findFirst({
      where: { accountId, currency: { code: CURRENCY_CODE.SATOSHI } },
      select: { currencyId: true, version: true },
    });

    const totalCommission = UtilsService.getInstance().calculateCommission(
      commissions.reduce((sum, item) => sum + item.commission, 0),
    );
    this._logger.log(
      `getCommissionHistories accountId: ${accountId} totalCommission: ${totalCommission}`,
    );

    if (totalCommission === 0) {
      throw new BadRequestException([
        {
          field: 'commissions',
          message: VALIDATE_MESSAGE.ACCOUNT.COMMISSION_INVALID,
        },
      ]);
    }
    const { ask, bid } =
      exchangeRate[`${CURRENCY_CODE.SATOSHI}${CURRENCY_CODE.VNDC}`];
    const amount = Math.round(totalCommission / Number(ask < bid ? ask : bid));

    const rate = COMMISSION_RATE.find(
      (rate) =>
        totalCommission >= rate.min &&
        (!rate.max || totalCommission <= rate.max),
    );
    const bulkOps: PrismaPromise<any>[] = commissions.map((c) =>
      this._repo.getAccountPartnerCommission().update({
        where: { id: c.id },
        data: {
          isApproved: true,
          paid: Math.round(c.commission * rate.value),
        },
      }),
    );

    const transactionId = UtilsService.getInstance().getDbDefaultValue().id;
    const description = NOTIFY_DESCRIPTION.PARTNER_COMMISSION.replace(
      '$value',
      `${totalCommission}`,
    );
    const payload = {
      version: cbAvailable.version,
      cbTransaction: {
        amount,
        currencyId: cbAvailable.currencyId,
        id: transactionId,
        receiverId: accountId,
        title: COMMON_TITLE[CASHBACK_TYPE.PARTNER_COMMISSION],
        description: COMMON_NOTE_STATUS[CASHBACK_STATUS.SUCCESS],
        status: CASHBACK_STATUS.SUCCESS,
        actionType: CASHBACK_ACTION_TYPE.ADD,
        type: CASHBACK_TYPE.PARTNER_COMMISSION,
        cbHistories: {
          cbHistories: [
            {
              note: COMMON_NOTE_STATUS[CASHBACK_STATUS.SUCCESS],
              updatedAt: new Date().toISOString(),
              updatedBy: user.id,
            },
          ],
        },
      },
    };
    bulkOps.push(
      this._repo.getNotification().create({
        data: {
          accountId,
          description,
          ref: transactionId,
          type: NOTIFICATION_TYPE.PARTNER_COMMISSION,
          title: COMMON_TITLE[CASHBACK_TYPE.PARTNER_COMMISSION],
        },
      }),
    );

    await this._clientWallet
      .send(MESSAGE_PATTERN.WALLET.PARTNER_COMMISSION, payload)
      .toPromise();
    this._repo.transaction(bulkOps).then(() => {
      this._notification.sendCommissionForPartner([accountId], description);
    });
    return { status: true };
  }

  async sendNotificationForAccount(
    body: SendNotificationRequestDto,
    query: SendNotificationQueryDto,
  ) {
    this._logger.log(
      `sendNotificationForAccount query: ${JSON.stringify(query)}`,
    );
    const isPartner =
      query.isPartner !== undefined ? !!query.isPartner : undefined;

    const where = {
      deviceToken: { not: null },
      isPartner,
      kycStatus: query.kycStatus,
    };
    if (query.isWithdrawal !== undefined) {
      const currency = await this._repo.getCurrency().findUnique({
        where: { code: CURRENCY_CODE.SATOSHI },
        select: { id: true },
      });
      const amount =
        UtilsService.getInstance().getAccountMinHold() +
        UtilsService.getInstance().getAmountExchangeMin();
      if (query.isWithdrawal) where.kycStatus = KYC_STATUS.APPROVED;
      where['cbAvailable'] = {
        some: {
          currencyId: currency.id,
          amount: query.isWithdrawal ? { gte: amount } : { lt: amount },
        },
      };
    }
    const totalAccounts = await this._repo.getAccount().count({ where });
    this._logger.log(
      `sendNotificationForAccount totalAccounts ${totalAccounts}`,
    );
    if (!totalAccounts) return { totalAccounts: 0 };

    this.sendNotifications(where, totalAccounts, body.title, body.description);
    return { totalAccounts };
  }

  private async sendNotifications(
    where: unknown,
    totalAccounts,
    title: string,
    description: string,
  ) {
    let count = Math.floor(totalAccounts / MAX_QUOTA_DEVICE_TOKEN);
    do {
      const output = await Promise.all(
        this.getQueryAccountByIndex(count, where),
      );
      output.forEach((accounts) =>
        this.processSendNotification(accounts, title, description),
      );
      count -= MAX_CONNECTION_POOL;
    } while (count >= 0);
  }

  private getQueryAccountByIndex(count: number, where: unknown) {
    const select = {
      id: true,
      deviceToken: true,
      cbAvailable: { select: { amount: true } },
    };
    const take = MAX_QUOTA_DEVICE_TOKEN;
    const output = [];
    for (let i = count; i > count - MAX_CONNECTION_POOL; i--) {
      if (i >= 0)
        output.push(
          this._repo
            .getAccount()
            .findMany({ where, select, take, skip: take * i }),
        );
    }
    return output;
  }

  private async processSendNotification(
    accounts: { id: string; deviceToken: string }[],
    title: string,
    description: string,
  ) {
    this._logger.log(
      `processSendNotification totalAccounts: ${accounts.length}`,
    );
    const accountIds: string[] = [];
    const notifications = accounts.map((account) => {
      accountIds.push(account.id);
      return {
        title,
        description,
        type: NOTIFICATION_TYPE.SEND_NOTIFICATION,
        accountId: account.id,
      };
    });

    await this._repo.transaction([
      this._repo.getNotification().createMany({ data: notifications }),
    ]);
    if (accountIds.length) {
      this._notification.sendNotifications(accountIds, title, description);
    }
  }

  async processCashbackForAccount(accountId: string, accountName: string) {
    this._logger.debug(`processCashbackForAccount accountId: ${accountId}`);
    const sql = readFileSync(
      join(process.cwd(), 'sql/find-cb-pending-by-account.sql'),
    );

    const output = (await this._repo.sql(sql.toString(), [accountId])) as {
      id: string;
      amount: number;
      currencyId: string;
      type: number;
      description: string;
      status: number;
      senderId: string;
      receiverId: string;
      createdAt: Date | string;
      senderUpdated: Date | string;
      receiverUpdated: Date | string;
      cbHistories: {
        cbHistories: { note: string; updatedAt: Date | string }[];
      };
      receiverStatus: number;
      receiverDeviceToken: string;
      senderStatus: number;
    }[];

    const description = COMMON_NOTE_STATUS.REFERRAL[CASHBACK_STATUS.SUCCESS];
    for (const tran of output) {
      if (
        (tran.senderId === accountId &&
          tran.receiverStatus === KYC_STATUS.APPROVED) ||
        (tran.receiverId === accountId &&
          tran.senderStatus === KYC_STATUS.APPROVED) ||
        (tran.receiverId === accountId &&
          tran.type === CASHBACK_TYPE.NON_REFERRAL) ||
        (tran.receiverId === accountId &&
          tran.type === CASHBACK_TYPE.PARTNER_BONUS)
      ) {
        const histories = tran.cbHistories || { cbHistories: [] };
        histories['cbHistories'].push({
          note: description,
          updatedAt: new Date().toISOString(),
        });
        const typeReferral =
          tran.senderId === accountId
            ? NOTIFICATION_TYPE.REFERRAL_BY
            : NOTIFICATION_TYPE.REFERRAL_FROM;
        const descriptionReferralFrom =
          COMMON_NOTE_STATUS.REFERRAL.REFERRAL_BY_KYC_SUCCESS.replace(
            '$name',
            accountName,
          ).replace('$value', Intl.NumberFormat().format(tran.amount));

        const payload = {
          amount: tran.amount,
          cbTransaction: {
            id: tran.id,
            receiverId: tran.receiverId,
            currencyId: tran.currencyId,
            status: CASHBACK_STATUS.SUCCESS,
            description:
              tran.type === CASHBACK_TYPE.PARTNER_BONUS
                ? tran.description
                : description,
            cbHistories: histories as any,
          },
        };
        await this._clientWallet
          .send(MESSAGE_PATTERN.WALLET.APPROVE_KYC, payload)
          .toPromise();
        await this._repo.getNotification().create({
          data: {
            accountId: tran.receiverId,
            type:
              tran.type === CASHBACK_TYPE.NON_REFERRAL
                ? NOTIFICATION_TYPE.NON_REFERRAL
                : typeReferral,
            title:
              tran.type === CASHBACK_TYPE.PARTNER_BONUS
                ? tran.description
                : COMMON_TITLE[tran.type],
            description:
              tran.receiverId === accountId
                ? description
                : descriptionReferralFrom,
            ref: tran.id,
          },
        });

        if (tran.receiverId !== accountId) {
          this._notification.sendNotifyNewAccount(
            [tran.receiverId],
            descriptionReferralFrom,
          );
        }
      }
    }
  }
}
