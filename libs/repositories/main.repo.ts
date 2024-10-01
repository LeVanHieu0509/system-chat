import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { BaseClient } from './base.client';
import { PAGINATION } from '@app/common/constants';
import { Prisma, PrismaClient } from '@prisma/client';
import { UtilsService } from 'libs/utils/src';

export type Operation = PrismaClient;

class PageOptions {
  page: number;
  take: number;

  get skip(): number {
    return (this.page - 1) * this.take;
  }

  constructor(page = PAGINATION.PAGE, take = PAGINATION.SIZE) {
    this.page = page;
    this.take = take;
  }
}

@Injectable()
export class MainRepo
  extends BaseClient
  implements OnModuleInit, OnModuleDestroy
{
  sql<T = unknown>(
    sql: TemplateStringsArray | string,
    ...values: any[]
  ): Promise<T> {
    // Convert string to Prisma.Sql if necessary
    const query = typeof sql === 'string' ? Prisma.sql`${sql}` : sql;
    return this._client.$queryRaw<T>(query, ...values);
  }

  getAccount() {
    return this._client.account;
  }

  getAccountKycIPN() {
    return this._client.accountKycIPN;
  }

  getCbAvailable() {
    return this._client.cashbackAvailable;
  }

  getCbTrans() {
    return this._client.cashbackTransaction;
  }

  getCurrency() {
    return this._client.currencyMaster;
  }

  getUser() {
    return this._client.user;
  }

  getCampaign() {
    return this._client.campaign;
  }

  getCategoryMaster() {
    return this._client.categoryMaster;
  }

  getCampaignCategory() {
    return this._client.campaignCategory;
  }

  getJobCampaign() {
    return this._client.jobCampaignHistory;
  }

  getAccountReferral() {
    return this._client.accountReferral;
  }

  getAccountContact() {
    return this._client.accountContact;
  }

  getAccountSetting() {
    return this._client.accountSetting;
  }

  getAccountExchangeCurrency() {
    return this._client.accountExchangeCurrency;
  }

  getConfig() {
    return this._client.config;
  }

  getConfigCommission() {
    return this._client.configCommission;
  }

  getNotification() {
    return this._client.notification;
  }

  getAccountSummary() {
    return this._client.accountSummary;
  }

  getCbSummary() {
    return this._client.cashbackSummary;
  }

  getBanner() {
    return this._client.banner;
  }

  getConfigDailyLuckyWheel() {
    return this._client.configDailyLuckyWheel;
  }

  getConfigPaymentLuckyWheel() {
    return this._client.configPaymentLuckyWheel;
  }

  getAccountDailyLuckyWheel() {
    return this._client.accountDailyLuckyWheel;
  }

  getAccountPartnerCommission() {
    return this._client.accountPartnerCommission;
  }

  getPartnerTransaction() {
    return this._client.partnerTransaction;
  }

  getConfigEvent() {
    return this._client.configEvent;
  }

  getConfigAds() {
    return this._client.configAds;
  }

  getAccountRewardEvent() {
    return this._client.accountRewardEvent;
  }

  getChickenFarmExtraSlot() {
    return this._client.chickenFarmExtraSlot;
  }

  getChickenFarmAdult() {
    return this._client.chickenFarmAdult;
  }

  getChickenFarmRooster() {
    return this._client.chickenFarmRooster;
  }

  getChickenFarmEgg() {
    return this._client.chickenFarmEgg;
  }

  getChickenFarmEggEvent() {
    return this._client.chickenFarmEggEvent;
  }

  getChickenFarmMarket() {
    return this._client.chickenFarmMarket;
  }

  getChickenFarmEggHarvest() {
    return this._client.chickenFarmEggHarvest;
  }

  getChickenFarmTrans() {
    return this._client.chickenFarmTransaction;
  }

  getChickenFarmEvent() {
    return this._client.chickenFarmEvent;
  }

  getChickenFarmBreed() {
    return this._client.chickenFarmBreed;
  }

  getEvent() {
    return this._client.event;
  }

  getVNDCTransaction() {
    return this._client.vNDCTransaction;
  }

  getBrokerTransaction() {
    return this._client.cashbackTransactionBroker;
  }

  getConfigInterestRate() {
    return this._client.configInterestRate;
  }

  getConfigInterestRateHistory() {
    return this._client.configInterestRateHistory;
  }

  getInterestPayment() {
    return this._client.interestPayment;
  }

  getInterestPaymentAccount() {
    return this._client.interestPaymentAccount;
  }

  getReferralRanking() {
    return this._client.referralRanking;
  }

  getReferralRankingAccount() {
    return this._client.referralRankingAccount;
  }

  getAccountReferralStats() {
    return this._client.accountReferralStats;
  }

  getGoldenEggExchangeSetting() {
    return this._client.goldenEggExchangeSetting;
  }

  getCurrencyLimitSetting() {
    return this._client.currencyLimitSetting;
  }
  getBonusEvent() {
    return this._client.bonusEvent;
  }

  getBonusEventAccount() {
    return this._client.bonusEventAccount;
  }

  getPoolConfig() {
    return this._client.poolConfig;
  }

  getPoolValue() {
    return this._client.poolValue;
  }

  getPoolEggHistory() {
    return this._client.poolEggHistory;
  }

  getPoolBBCHistory() {
    return this._client.poolBBCHistory;
  }

  getPoolRateHistory() {
    return this._client.poolRateHistory;
  }

  onModuleInit() {
    this._client.$connect();
  }

  onModuleDestroy() {
    this._client.$disconnect();
  }

  getPagination(page?: number, size?: number) {
    return new PageOptions(page, size);
  }

  setServiceName(service: string) {
    this._service = service;
  }

  sendLogError(error: Error) {
    this._logger.warn(`sendLogError: ${error.stack}`);
    if (this._logClient) {
      const current = new Date();
      const date = current.toLocaleDateString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
      });
      const time = current.toLocaleTimeString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
      });
      this._logClient
        .db()
        .collection('log_error')
        .insertOne({ log: error.stack, createdAt: `${date} ${time}` })
        .then(() => undefined);
    }
  }

  async cleanDbLog() {
    if (this._logClient) {
      const format = 'YYYY-MM-DD';
      const today = UtilsService.getInstance().toDayJs(new Date());
      let regexStr = '';
      for (let i = 5; i > 0; i--) {
        const prevDay = today.set('day', Number(`-${i}`)).format(format);
        regexStr += prevDay + '|';
      }
      const collections = await this._logClient
        .db()
        .listCollections({}, { nameOnly: true })
        .toArray();
      collections.forEach(({ name }) => {
        this._logClient
          .db()
          .collection(name)
          .deleteMany({ params: { $regex: new RegExp(regexStr) } })
          .then((val) => console.log(`name, val`, name, val));
      });
    }
  }
}
