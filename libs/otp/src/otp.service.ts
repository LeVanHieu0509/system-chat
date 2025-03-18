import { CachingService } from '@app/caching';
import { OTP_TYPE } from '@app/common';
import { UtilsService } from '@app/utils';
import { Injectable, Logger } from '@nestjs/common';
import { UnitType } from 'dayjs';

type Time = { value: number; unit: UnitType };
type OTPConfig = {
  [key in OTP_TYPE]: {
    ttl: Time;
    resendAfter: Time;
    passcodeLength: number;
  };
};
export const OTP_CONFIG: OTPConfig = {
  [OTP_TYPE.SIGN_UP]: {
    ttl: { value: 5, unit: 'minutes' },
    resendAfter: { value: 30, unit: 'seconds' },
    passcodeLength: 4,
  },
  [OTP_TYPE.CASHBACK]: {
    ttl: { value: 10, unit: 'minutes' },
    resendAfter: { value: 2, unit: 'minutes' },
    passcodeLength: 6,
  },
  [OTP_TYPE.PAYMENT]: {
    ttl: { value: 10, unit: 'minutes' },
    resendAfter: { value: 2, unit: 'minutes' },
    passcodeLength: 6,
  },
  [OTP_TYPE.RESET_PASSCODE]: {
    ttl: { value: 30, unit: 'minutes' },
    resendAfter: { value: 2, unit: 'minutes' },
    passcodeLength: 6,
  },
  [OTP_TYPE.VERIFY_EMAIL]: {
    ttl: { value: 1, unit: 'day' },
    resendAfter: { value: 2, unit: 'minutes' },
    passcodeLength: 6,
  },
};

type CachingOTP = { otp: number; type: string; resendTime: number };

@Injectable()
export class OTPService {
  private readonly _logger = new Logger('OTPService');

  async generateOTP(key: string, type: string) {
    const cacheOTP = await CachingService.getInstance().get<CachingOTP>(key);
    if (cacheOTP && cacheOTP.resendTime >= new Date().getTime()) return;

    // generate OTP code
    const otp = UtilsService.getInstance().randomNumberByLength(
      OTP_CONFIG[type].passcodeLength,
    );
    const resendTime = UtilsService.getInstance()
      .toDayJs(new Date())
      .add(
        OTP_CONFIG[type].resendAfter.value,
        OTP_CONFIG[type].resendAfter.unit,
      );
    // save OTP to temporary cache for verifying later
    CachingService.getInstance().set(
      key,
      { otp, type, resendTime: resendTime.valueOf() },
      this.getExpires(type),
    );

    this._logger.log(`OTP: ${otp}`);
    // TODO-3 dispatch OTP code to third party
    return otp;
  }

  async verifyOTP(key: string, code: string | number, type: string) {
    // get OTP from temporary cache
    // const otp = OTPHelper.getOTP(key);
    const cache = await CachingService.getInstance().get<CachingOTP>(key);
    console.log({ cache });

    const valid = cache && `${cache.otp}` === `${code}` && cache.type === type;
    if (valid)
      setTimeout(() => {
        this._logger.log(`Clear OTP from key: ${key}`);
        CachingService.getInstance().delete(key);
      }, 100);

    return valid;
  }

  getExpires(type: string) {
    const { ttl } = OTP_CONFIG[type];
    const currentDate = UtilsService.getInstance().toDayJs(new Date());
    return currentDate.add(ttl.value, ttl.unit).diff(new Date(), 'seconds');
  }
}
