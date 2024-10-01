import { Prisma } from '.prisma/client';
import {
  COMMISSION_RATE,
  CURRENCY_CODE,
  LATEST_VERSION,
} from '@app/common/constants';

import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { AES, enc } from 'crypto-ts';
import { default as dayjs } from 'dayjs';
import { CountryCode, parsePhoneNumber, PhoneNumber } from 'libphonenumber-js';
import {
  ACCESS_TRADE_SUFFIX,
  AMOUNT_MIN_HOLD,
  AMOUNT_SEND_OFF_CHAIN_MIN,
  RESET_PASSCODE_PRIVATE_KEY,
  VNDC_AMOUNT_EXCHANGE_MIN,
} from 'libs/config';
import { default as MD5 } from 'md5';
import { default as NodeRSA } from 'node-rsa';
import { v1 as uuid } from 'uuid';

export type Dayjs = dayjs.Dayjs;

const CHARS = '123456789abcdefghijklmnopqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';

type DataCurrencyOutput = {
  amount?: { value: string; currency: string };
  fee?: { value: string; currency: string };
  currency: unknown;
};
export class UtilsService {
  private static _instance: UtilsService;
  private readonly _hashText =
    '2a10TEoTTNp8SpRb3H8HpRjJ098RNcoARSgQIE29pKVk8sSJU4HZMFW';

  static getInstance() {
    if (this._instance) return this._instance;
    this._instance = new UtilsService();
    Object.freeze(this._instance);
    return this._instance;
  }

  /**
   * Convert any phone format to international format
   *
   * Default country is Vietnam
   *
   * @param phone
   * @param defaultCountry
   * @returns The International format
   */
  toIntlPhone(phone: string, defaultCountry: CountryCode = 'VN') {
    return parsePhoneNumber(phone, defaultCountry)
      .formatInternational()
      ?.replace(/\s/g, '');
  }

  /**
   * Get information phone(countryCallingCode, nationalNumber)
   *
   * Default country is Vietnam
   *
   * @param phone
   * @param defaultCountry
   * @returns The information phone
   */
  getInfoPhone(phone: string, defaultCountry: CountryCode = 'VN') {
    const phoneNumber: PhoneNumber = parsePhoneNumber(phone, defaultCountry);
    return {
      countryCode: phoneNumber.countryCallingCode.toString(),
      nationalNumber: +phoneNumber.nationalNumber,
    };
  }

  /**
   * Get firstName, lastName
   *
   *
   * @param fullName
   * @returns firstName, lastName
   */
  extractName(fullName: string) {
    const latinName = this.convertToNormalLatin(fullName);
    const index = latinName.indexOf(' ');

    return {
      firstName: latinName.substring(0, index) || latinName,
      lastName: latinName.substring(index + 1, latinName.length),
    };
  }

  getUnixDate(date: dayjs.Dayjs, defaultTime = 1000) {
    return dayjs(date).unix() * defaultTime;
  }

  /**
   * Convert original text to hash text
   *
   * @param text
   * @returns The hash text
   */
  hashValue(text: string) {
    return hashSync(text, genSaltSync(10));
  }

  /**
   * Compare hash
   *
   * @param text
   * @param hashText
   * @returns result
   */
  compareHash(text: string, hashText: string) {
    return compareSync(text, hashText);
  }

  /**
   * Random token
   *
   * @param length
   * @returns token
   */
  randomToken(length: number) {
    const result = [];
    for (let index = 0; index < length; index++) {
      result.push(
        this._hashText.charAt(
          Math.floor(Math.random() * this._hashText.length),
        ),
      );
    }
    return result.join('');
  }

  /**
   * Random alphanumeric
   *
   * @param length
   * @returns alphanumeric
   */
  randomAlphanumeric(length: number) {
    let result = '';
    for (let i = length; i > 0; --i)
      result += CHARS[Math.floor(Math.random() * CHARS.length)];
    return result;
  }

  /**
   * convert data use currency
   *
   * @param data  DataCurrencyInput[]
   * @returns DataCurrencyOutput[]
   */
  convertDataCurrency(
    data: { amount: Prisma.Decimal; fee: number; currency: { code: string } }[],
    version: string,
  ): DataCurrencyOutput[] {
    return data.map((item) => {
      const { amount, fee, ...others } = item;
      const output: DataCurrencyOutput = { ...others };
      output.amount = {
        value:
          version === LATEST_VERSION
            ? amount.toString()
            : (+`${amount || 0}`.replace(/"(-?\d+)n"/g, '') as any),
        currency: others.currency?.code || CURRENCY_CODE.VNDC,
      };
      if (fee !== undefined) {
        output.fee = {
          value: version === LATEST_VERSION ? fee.toString() : (fee as any),
          currency: others.currency?.code,
        };
      }
      return output;
    });
  }

  /**
   * convert Vietnamese to latin
   *
   * @param string
   * @returns string
   */
  convertToNormalLatin(str: string): string {
    if (!str) return '';
    else {
      str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
      str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
      str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
      str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
      str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
      str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
      str = str.replace(/(đ)/g, 'd');

      str = str.replace(/(À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ)/g, 'A');
      str = str.replace(/(È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ)/g, 'E');
      str = str.replace(/(Ì|Í|Ị|Ỉ|Ĩ)/g, 'I');
      str = str.replace(/(Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ)/g, 'O');
      str = str.replace(/(Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ)/g, 'U');
      str = str.replace(/(Ỳ|Ý|Ỵ|Ỷ|Ỹ)/g, 'Y');
      str = str.replace(/(Đ)/g, 'D');
      return str;
    }
  }

  getWeekOfYear(date: Date) {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayOfYear =
      (today.getTime() - startDate.getTime() + 86400000) / 86400000;

    return Math.ceil(dayOfYear / 7);
  }

  getUnitDate(date: Date = new Date()) {
    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      week: this.getWeekOfYear(date),
    };
  }

  getDbDefaultValue(includeDate?: boolean) {
    const output = { id: uuid() as string };
    if (includeDate) output['createdAt'] = new Date(new Date().toUTCString());
    return output;
  }

  calculateCommission(total: number) {
    if (!total) return 0;
    const rate = COMMISSION_RATE.find(
      (rate) => total >= rate.min && (!rate.max || total <= rate.max),
    );
    return total * rate.value;
  }

  encryptByCrypto(data: unknown, key: string): string {
    return AES.encrypt(JSON.stringify(data), key).toString();
  }

  decryptByCrypto<T>(message: string, key: string): T {
    const bytes = AES.decrypt(message, key);
    const output = bytes.toString(enc.Utf8) || '{}';
    return JSON.parse(output) as T;
  }

  convertBigIntToNumber(bigint: bigint): number {
    return +`${bigint}`.replace(/"(-?\d+)n"/g, '');
  }

  toDayJs(val: number | string | Date, format?: dayjs.OptionType): dayjs.Dayjs {
    return dayjs(val, format);
  }

  generateRandomInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max + 1 - min));
  }

  isPassDateTime(val: bigint) {
    return new Date() > new Date(this.convertBigIntToNumber(val));
  }

  isFutureDateTime(val: bigint) {
    return new Date() < new Date(this.convertBigIntToNumber(val));
  }

  getExchangeAsk(number1: string, number2: string) {
    return Math.min(Number(number1), Number(number2));
  }

  getExchangeBid(number1: string, number2: string) {
    return Math.max(Number(number1), Number(number2));
  }

  decryptPasscode(hashed: string) {
    const key = new NodeRSA(RESET_PASSCODE_PRIVATE_KEY, 'private', {
      encryptionScheme: 'pkcs1',
    });

    return key.decrypt(hashed, 'utf8');
  }

  md5Hash(message: string | Buffer | number[] | Uint8Array) {
    return MD5(message);
  }

  getCampaignUtmSource = () => 'bitback-' + ACCESS_TRADE_SUFFIX;

  getAccountMinHold = () => AMOUNT_MIN_HOLD;

  getAmountExchangeMin = () => AMOUNT_SEND_OFF_CHAIN_MIN;

  getVNDCAmountExchangeMin = () => VNDC_AMOUNT_EXCHANGE_MIN;

  weightedRand<TValue>(spec: { rate: number; value: TValue }[]) {
    return function () {
      const r = Math.random();
      let sum = 0;
      for (const v of spec) {
        sum += v.rate;
        if (r <= sum) return v.value;
      }
    };
  }

  normalizeReferralRankingPrizeRateConfig(
    referralRankingPrizeRate: Record<string, number>,
  ): Record<string, number> {
    const prizeRateMap: Record<string, number> = {};

    for (const [prizeRange, prizeRate] of Object.entries(
      referralRankingPrizeRate,
    )) {
      const [begin, end] = prizeRange.split('-');
      for (let rank = +begin; rank <= +(end ?? begin); rank++) {
        prizeRateMap[`${rank}`] = prizeRate / 100;
      }
    }

    return prizeRateMap;
  }

  shiftSqlParams(sql: string, length: number) {
    return sql.replace(/\$(\d.*)/g, (s, ...args) => {
      return `$${+args[0] + length}`;
    });
  }

  randomNumberByLength(length: number) {
    const min = 10 ** (length - 1);
    const max = 9 * min - 1;
    return Math.floor(min + Math.random() * max);
  }

  compareVersion(v1: string, v2: string) {
    if (typeof v1 !== 'string' || typeof v2 !== 'string') return false;

    const levels1 = v1.split('.');
    const levels2 = v2.split('.');

    const length = Math.max(levels1.length, levels2.length);

    for (let i = 0; i < length; i++) {
      const v1 = i < levels1.length ? parseInt(levels1[i]) : 0;
      const v2 = i < levels2.length ? parseInt(levels2[i]) : 0;

      if (v1 > v2) return 1;
      if (v2 > v1) return -1;
    }

    return 0;
  }
}
