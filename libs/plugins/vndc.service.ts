import { CachingService } from '@app/caching';
import {
  BITCOIN_CODE,
  BTC_UNIT,
  CURRENCY_CODE,
  VNDC_RESPONSE_OFF_CHAIN_CODE,
} from '@app/common';

import { VNDCSendOffChainBody } from '@app/dto';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import {
  IS_PRODUCTION,
  VNDC_CHECK_INFO,
  VNDC_COUNT_USER,
  VNDC_KEY,
  VNDC_SEND_OFF_CHAIN,
  VNDC_TRANSACTION_DETAIL,
} from 'libs/config';
import { firstValueFrom, lastValueFrom } from 'rxjs';

const VNDC_CONFIG = {
  headers: {
    'Access-Client-Token': VNDC_KEY, // Access-Client-Token để xác thực với API của VNDC
    'Content-Type': 'application/json',
  },
};

/*
  - Kiểu dữ liệu lưu trữ tỷ giá với bid, ask là các giá trị tỷ giá mua và bán, market chỉ thị thị trường tiền tệ
  - time là thời gian cập nhật.
*/
export type ExchangeRate = Record<
  string,
  { bid: string; ask: string; market: string; time: number }
>;

// Các kiểu dữ liệu này lưu trữ thông tin giao dịch và người dùng liên quan đến giao dịch.
export type Transaction = {
  id: string;
  display: string;
  transactionNumber: string;
  currency: { name: string; symbol: string };
  amount: string;
  from: User;
  to: User;
  date: string;
};

type User = {
  user: { id: string; display: string; shortDisplay: string };
  kind: string;
};

// Là lớp dịch vụ được đánh dấu với @Injectable() để NestJS có thể quản lý phụ thuộc.
@Injectable()
export class VNDCService {
  private readonly _logger: Logger = new Logger('VNDCService');
  constructor(private readonly httpService: HttpService) {} //HttpService là một dịch vụ HTTP từ @nestjs/axios để thực hiện các yêu cầu HTTP, giúp lấy dữ liệu từ API VNDC.

  // Lấy tỷ giá trao đổi giữa các loại tiền tệ (như VNDC, BTC).

  /*
    Kiểm tra trong bộ nhớ cache xem tỷ giá đã được lưu chưa.
    Nếu chưa có, gửi yêu cầu HTTP đến API của VNDC để lấy tỷ giá.
    Lưu tỷ giá vào cache trong 10 giây để giảm tải yêu cầu tiếp theo.
  */

  async getExchangeRate() {
    this._logger.log(`getExchangeRate`);

    // 1. kiểm tra xem dữ liệu tỷ giá có sẵn trong bộ nhớ cache không
    const output =
      await CachingService.getInstance().get<ExchangeRate>('EXCHANGE_RATE');
    if (output) return output;

    const vndcExchange = 'https://exchange.vndc.io/exchange/api/v1/user/prices';

    //2. Call API
    const res = await firstValueFrom(
      this.httpService.get<ExchangeRate>(vndcExchange),
    );

    // const res = await this.httpService.get(ConfigService.getInstance().get('EXCHANGE_RATE'), VNDC_CONFIG).toPromise();

    const vndcExchangeRates = res.data || {};
    const result: ExchangeRate = {};

    //3. Lặp qua các mã tiền tệ để lấy tỷ giá của từng loại so với VNDC.
    for (const key in CURRENCY_CODE) {
      //  Nếu là VNDC, bỏ qua vì đây là đồng tiền ổn định.
      if (key === 'VNDC') continue; // stable coin
      if (key === 'BBC') {
        // Nếu là BBC, lấy tỷ giá từ dữ liệu API. Nếu có tỷ giá, sử dụng ask, bid từ API và áp dụng hệ số nhân (1.0125 cho bid và 0.9875 cho ask).
        // Nếu không có, sử dụng giá trị mặc định là 2400.
        const rate =
          vndcExchangeRates[`${CURRENCY_CODE[key]}${CURRENCY_CODE.VNDC}`];
        if (rate) {
          const { ask, bid, time } = rate;
          result[`${CURRENCY_CODE[key]}${CURRENCY_CODE.VNDC}`] = {
            bid: `${Number(bid) * 1.0125}`,
            ask: `${Number(ask) * 0.9875}`,
            time,
            market: `${CURRENCY_CODE[key]}${CURRENCY_CODE.VNDC}`,
          };
        } else {
          result[`${CURRENCY_CODE[key]}${CURRENCY_CODE.VNDC}`] = {
            bid: `${2400 * 1.0125}`,
            ask: `${2400 * 0.9875}`,
            time: Math.floor(Date.now() / 1000),
            market: `${CURRENCY_CODE[key]}${CURRENCY_CODE.VNDC}`,
          };
        }
        // Nếu là SATOSHI, tỷ giá từ VNDC so với SATOSHI được tính bằng cách chuyển đổi từ BTC và
        // chia cho BTC_UNIT để chuyển đổi từ BTC sang SATOSHI
      } else if (key === 'SATOSHI') {
        const { ask, bid, time } =
          vndcExchangeRates[`${BITCOIN_CODE}${CURRENCY_CODE.VNDC}`];
        result[`${CURRENCY_CODE[key]}${CURRENCY_CODE.VNDC}`] = {
          bid: `${(Number(bid) * 1.0125) / BTC_UNIT}`,
          ask: `${(Number(ask) * 0.9875) / BTC_UNIT}`,
          time,
          market: `${CURRENCY_CODE[key]}${CURRENCY_CODE.VNDC}`,
        };
      } else {
        const rate =
          vndcExchangeRates[`${CURRENCY_CODE[key]}${CURRENCY_CODE.VNDC}`];
        if (!rate) continue;
        const { ask, bid, time } = rate;
        result[`${CURRENCY_CODE[key]}${CURRENCY_CODE.VNDC}`] = {
          bid: `${Number(bid) * 1.0125}`,
          ask: `${Number(ask) * 0.9875}`,
          time,
          market: `${CURRENCY_CODE[key]}${CURRENCY_CODE.VNDC}`,
        };
      }
    }
    // Lưu trữ kết quả result vào cache trong 10 giây để giảm tải các yêu cầu tương lai.
    CachingService.getInstance().set('EXCHANGE_RATE', result, 10);
    return result;
  }

  // Kiểm tra thông tin tài khoản VNDC của người dùng dựa trên từ khóa (thường là email hoặc số điện thoại).
  async getAccountVNDC(keywords: string) {
    this._logger.log(`getAccountVNDC keywords: ${keywords}`);
    const url = VNDC_CHECK_INFO;
    let account: { name: string; kyc: boolean; keywords: string };
    // try {
    //   const res = await firstValueFrom(
    //     this.httpService.post(url, { keywords }, VNDC_CONFIG),
    //   );

    //   if (!res.data?.kyc) {
    //     return null;
    //   }
    //   account = { name: res.data?.name, kyc: res.data?.kyc, keywords };
    //   return account;
    // } catch (error) {
    //   this._logger.log(`getAccountVNDC Error: ${JSON.stringify(error)}`);
    //   return null;
    // }
    account = { name: 'Le Van Hieu', kyc: true, keywords: 'hieu' };
    return account;
  }

  async sendOffChain(body: VNDCSendOffChainBody) {
    let response: {
      code: string;
      data: { transaction_number: string };
      message?: string;
    };
    if (!IS_PRODUCTION) {
      //whitelist receiver for testing purpose
      if (body.account_receive === 'tamdesktop@gmail.com') {
        response = {
          code: VNDC_RESPONSE_OFF_CHAIN_CODE.SUCCESS,
          data: { transaction_number: 'VNDC125802515' },
        };
        return response;
      }
    }
    try {
      const res = await lastValueFrom(
        this.httpService.post(VNDC_SEND_OFF_CHAIN, body, VNDC_CONFIG),
      );

      response = res.data;
    } catch (error) {
      response = error.response ? error.response.data : 'unknown';
    }
    return response;
  }

  async getTotalAccountsVNDC(
    timeFrom?: string,
    timeTo?: string,
  ): Promise<{ totalAccounts: number }> {
    this._logger.log(
      `getTotalAccountsVNDC timeFrom: ${timeFrom} timeTo: ${timeTo}`,
    );

    let url = VNDC_COUNT_USER;
    if (timeFrom && timeTo) url += '&creationPeriod=' + timeFrom + ',' + timeTo;

    const res = await this.httpService.get(url, VNDC_CONFIG).toPromise();
    return { totalAccounts: Number(res.headers['x-total-count']) };
  }

  async getTransactionInfo(transactionNumber: string) {
    const url = VNDC_TRANSACTION_DETAIL + transactionNumber;
    const res = await lastValueFrom(
      this.httpService.get<Transaction>(url, VNDC_CONFIG),
    );

    // clean up data
    const transaction = res.data;
    const { amount, currency, date, display, id, from, to } = transaction;
    const output: Transaction = {
      amount,
      currency: { name: currency.name, symbol: currency.symbol },
      date,
      display,
      id,
      from: {
        kind: from.kind,
        user: {
          id: from.user.id,
          display: from.user.display,
          shortDisplay: from.user.shortDisplay,
        },
      },
      to: {
        kind: to.kind,
        user: {
          id: to.user.id,
          display: to.user.display,
          shortDisplay: to.user.shortDisplay,
        },
      },
      transactionNumber,
    };
    return output;
  }
}
