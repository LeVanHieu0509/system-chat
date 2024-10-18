import { CASHBACK_TYPE } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { join } from 'path';
import { COMMON_TITLE } from './notification.description';
import { MainRepo } from 'libs/repositories/main.repo';

const options: admin.messaging.MessagingOptions = {
  priority: 'normal',
  timeToLive: 60 * 60 * 24,
};

@Injectable()
export class NotificationV2Service {
  private readonly _logger = new Logger(NotificationV2Service.name);

  constructor(private readonly _repo: MainRepo) {
    const url = join(process.cwd(), 'config/trustpay-dev-firebase.json');
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(url) });
    }
  }

  async sendNotifications(accountIds: string[], title: string, body: string) {
    this._logger.log(`sendNotifications - content: ${body}`);
    this.notify(accountIds, title, body);
  }

  async sendNotifyKYCSuccess(accountIds: string[], body: string) {
    this._logger.log(`sendNotifyKYCSuccess - content: ${body}`);
    this.notify(accountIds, COMMON_TITLE.KYC, body);
  }

  async sendNotifyNewAccount(
    accountIds: string[],
    body: string,
    nonReferral?: boolean,
  ) {
    this._logger.log(`sendNotifyReferral - content: ${body}`);
    this.notify(
      accountIds,
      COMMON_TITLE[
        nonReferral ? CASHBACK_TYPE.NON_REFERRAL : CASHBACK_TYPE.REFERRAL
      ],
      body,
    );
  }

  async sendNotifyCashbackExchange(accountIds: string[], body: string) {
    this._logger.log(`sendNotifyCashbackExchange - content: ${body}`);
    this.notify(accountIds, COMMON_TITLE[CASHBACK_TYPE.EXCHANGE], body);
  }

  async sendNotifyWalletPayment(
    accountIds: string[],
    body: string,
    title?: string,
  ) {
    this._logger.log(
      `sendNotifyWalletPayment - content: ${body} title: ${title}`,
    );
    this.notify(accountIds, title || COMMON_TITLE.PAYMENT, body);
  }

  async sendBuyEgg(accountIds: string[], body: string) {
    this._logger.log(`sendBuyEgg - content: ${body}`);
    this.notify(accountIds, COMMON_TITLE[CASHBACK_TYPE.BUY_EGG_EVENT], body);
  }

  async sendBonusAndCommissionGoldenEgg(
    accountIds: string[],
    body: string,
    type: number,
  ) {
    this._logger.log(`sendBonusGoldenEgg - content: ${body}`);
    this.notify(accountIds, COMMON_TITLE.CF_TRANSACTION[type], body);
  }

  async sendCommissionForPartner(
    accountIds: string[],
    body: string,
    title?: string,
  ) {
    this._logger.log(`sendCommissionForPartner - content: ${body}`);
    this.notify(
      accountIds,
      title || COMMON_TITLE[CASHBACK_TYPE.PARTNER_COMMISSION],
      body,
    );
  }

  async sendDailyReward(accountIds: string[], body: string) {
    this._logger.log(`sendDailyReward - content: ${body}`);
    this.notify(accountIds, COMMON_TITLE[CASHBACK_TYPE.DAILY_REWARD], body);
  }

  async sendNotifyPayment(accountIds: string[], body: string) {
    this._logger.log(`sendNotifyPayment - content: ${body}`);
    this.notify(accountIds, COMMON_TITLE[CASHBACK_TYPE.PAYMENT], body);
  }

  private async notify(accountIds: string[], title: string, body: string) {
    const deviceTokens =
      await this.getNotifiableAccountDeviceTokens(accountIds);
    if (deviceTokens.length) {
      admin
        .messaging()
        .sendToDevice(deviceTokens, { notification: { title, body } }, options)
        .then(() => this.sendNotifySuccess(body));
    }
  }

  private async getNotifiableAccountDeviceTokens(accountIds: string[]) {
    const deviceTokens: string[] = [];
    const accounts = await this._repo.getAccount().findMany({
      where: { id: { in: accountIds } },
      select: {
        deviceToken: true,
        accountSetting: { select: { receiveNotify: true } },
      },
    });

    for (const account of accounts) {
      if (
        account &&
        account.deviceToken &&
        (!account.accountSetting || account.accountSetting.receiveNotify)
      ) {
        deviceTokens.push(account.deviceToken);
      }
    }

    return deviceTokens;
  }

  private sendNotifySuccess(message: string) {
    this._logger.log(`sendNotificationSuccess - content: ${message}`);
  }
}
