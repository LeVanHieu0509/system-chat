import {
  CASHBACK_STATUS,
  CASHBACK_TYPE,
  CHICKEN_FARM_TRANSACTION_TYPE,
  KYC_STATUS,
} from '@app/common';

export const NOTIFY_DESCRIPTION = {
  PAYMENT: {
    [CASHBACK_STATUS.SUCCESS]:
      'Giao dịch hoàn tiền cho đơn hàng trị giá $value ₫ của bạn tại $name đã được xử lý thành công.',
    [CASHBACK_STATUS.PROCESSING]:
      'Giao dịch hoàn tiền cho đơn hàng trị giá $value ₫ của bạn tại $name đang được xử lý.',
    [CASHBACK_STATUS.REJECTED]:
      'Giao dịch hoàn tiền cho đơn hàng trị giá $value ₫ của bạn tại $name bị từ chối.',
    [CASHBACK_STATUS.APPROVED]:
      'Giao dịch hoàn tiền cho đơn hàng trị giá $value ₫ của bạn tại $name sẽ vào cashback từ 60-90 ngày.',
  },
  REWARD_CHAIN: 'Bạn vừa dùng $value để đổi thưởng.',
  CB_OFF_CHAIN_RECEIVER: 'Bạn vừa nhận $value từ $name.',
  CB_OFF_CHAIN_SENDER: 'Bạn vừa chuyển $value đến $name.',
  CB_ON_CHAIN: 'Bạn vừa chuyển $value đến ví $name.',
  REFERRAL_FROM:
    'Bạn vừa nhận được $value khi đăng ký tài khoản thông qua $name.',
  REFERRAL_BY:
    'Bạn vừa nhận được $value khi giới thiệu ứng dụng Bitback cho $name.',
  NON_REFERRAL: 'Bạn vừa nhận được $value khi đăng ký ứng dụng Bitback.',
  PARTNER_COMMISSION: 'Bạn đã được duyệt $value ₫ hoa hồng tháng này.',
  BREED_CHICKEN:
    'Bạn đã phối giống thành công gà mái $henNo.$henName và gà trống $roosterNo.$roosterName với phí là $feeđ',
  INTEREST_PAYMENT:
    'Bạn vừa nhận được $toInterestAmount$toWalletCode tiền lãi từ $fromWalletAmount$fromWalletCode',
  AWARD_REFERRAL_RANKING:
    'Bạn vừa nhận được $prizeAmount$currencyCode khi xếp thứ $rank trong bảng xếp hạng',
  WALLET_PAYMENT: {
    SUCCEEDED: 'Nạp thành công $valueSAT với giá tiền thanh toán $valueVNDCđ.',
    FAILED: 'Nạp thất bại $valueSAT với giá tiền thanh toán $valueVNDCđ.',
    CANCELED: 'Nạp thất bại $valueSAT với giá tiền thanh toán $valueVNDCđ.',
    EXPIRED: 'Nạp thất bại $valueSAT với giá tiền thanh toán $valueVNDCđ.',
    REFUNDED: 'Nạp thất bại $valueSAT với giá tiền thanh toán $valueVNDCđ.',
    PENDING:
      'Nạp $valueSAT với giá tiền thanh toán $valueVNDCđ đang được xử lý.',
  },
  DEPOSIT: {
    SUCCEEDED: 'Nạp thành công $amount với giá tiền thanh toán $paidAmountđ.',
    FAILED: 'Nạp thất bại $amount với giá tiền thanh toán $paidAmountđ.',
    CANCELED: 'Nạp thất bại $amount với giá tiền thanh toán $paidAmountđ.',
    EXPIRED: 'Nạp thất bại $amount với giá tiền thanh toán $paidAmountđ.',
    REFUNDED: 'Nạp thất bại $amount với giá tiền thanh toán $paidAmountđ.',
    PENDING:
      'Nạp $amount với giá tiền thanh toán $paidAmountđ đang được xử lý.',
  },
  CF_TRANSACTION: {
    [CHICKEN_FARM_TRANSACTION_TYPE.GOLDEN_EGG]: 'Bán $value trứng vàng.',
    [CHICKEN_FARM_TRANSACTION_TYPE.COMMISSION_GOLDEN_EGG]:
      'Bạn đã nhận được $value trứng vàng từ $name',
    [`${CHICKEN_FARM_TRANSACTION_TYPE.EGG}_SELL`]:
      'Bán $quantity trứng ấp$buyer.',
    [`${CHICKEN_FARM_TRANSACTION_TYPE.EGG}_BUY`]:
      'Mua $quantity trứng ấp từ $sellerName.',
    [`${CHICKEN_FARM_TRANSACTION_TYPE.HEN}_SELL_P2P`]:
      'Bán $chickenName Lv.$chickenLevel$buyer.',
    [`${CHICKEN_FARM_TRANSACTION_TYPE.HEN}_BUY`]:
      'Mua $chickenName Lv.$chickenLevel từ $sellerName.',
    [`${CHICKEN_FARM_TRANSACTION_TYPE.ROOSTER}_SELL_P2P`]:
      'Bán gà trống $chickenName cho $buyer.',
    [`${CHICKEN_FARM_TRANSACTION_TYPE.ROOSTER}_BUY`]:
      'Mua gà trống $chickenName từ $sellerName.',
  },
  BUY_EGG: {
    [CASHBACK_STATUS.SUCCESS]: 'Bạn đã mua thành công $value trứng ấp.',
    [CASHBACK_STATUS.REJECTED]: 'Mua $value trứng ấp thất bại. ',
  },
  SELL_EGG: {
    [CASHBACK_STATUS.SUCCESS]: 'Bạn đã bán thành công $quantity trứng ấp.',
  },
  SELL_CHICKEN: {
    [CASHBACK_STATUS.SUCCESS]:
      'Bạn đã bán thành công gà $chickenNo.$chickenName Lv.$chickenLevel với giá $priceđ cho $buyer.',
  },
  SELL_ROOSTER_CHICKEN: {
    [CASHBACK_STATUS.SUCCESS]:
      'Bạn đã bán thành công gà $chickenNo.$chickenName với giá $priceđ cho $buyer.',
  },
  BUY_CHICKEN: {
    [CASHBACK_STATUS.SUCCESS]:
      'Bạn đã mua thành công gà $chickenNo.$chickenName Lv.$chickenLevel với giá $priceđ từ $seller.',
  },
  BUY_ROOSTER_CHICKEN: {
    [CASHBACK_STATUS.SUCCESS]:
      'Bạn đã mua thành công gà $chickenNo.$chickenName với giá $priceđ từ $seller.',
  },
  KYC: {
    [KYC_STATUS.APPROVED]: 'Thông tin KYC được duyệt thành công.',
    [KYC_STATUS.REJECTED]: 'Thông tin KYC bị từ chối.',
    [KYC_STATUS.PENDING]: 'Thông tin KYC đang được xử lý.',
  },
  BUY_EXTRA_SLOT: {
    [CASHBACK_STATUS.SUCCESS]:
      'Bạn đã mua thành công $values ô mở rộng cho trang trại.',
  },
  EXCHANGE_COIN: {
    [CASHBACK_TYPE.EXCHANGE_COIN_IN]: 'Bạn nhận được $1 $2 từ việc đổi $3 $4.',
    [CASHBACK_TYPE.EXCHANGE_COIN_OUT]: 'Bạn đã đổi thành công $1 $2 sang $3.',
  },
};

export const COMMON_NOTE_STATUS = {
  CREATE_DAILY_LUCKY_WHEEL: 'Lượt quay may mắn mới trong ngày.',
  CREATE_ACCOUNT_SUCCESS: 'Tạo mới tài khoản thành công.',
  SELL_GOLDEN_EGG: 'Bán trứng vàng.',
  UPGRADE_ACCOUNT: 'Nâng cấp tài khoản người dùng.',
  SUBMIT_DAILY_LUCKY_WHEEL: 'Lượt quay may mắn trong ngày đã được sử dụng.',
  DAILY_REWARD_APPROVED_SUCCESS: ' Phần thưởng của bạn đã được duyệt.',
  DAILY_REWARD_APPROVED_REJECTED: ' Phần thưởng của bạn đã bị từ chối.',
  DAILY_REWARD_PAYMENT: ' Phần thưởng có hiệu lực trong vòng 24h.',
  DAILY_REWARD_PAYMENT_USED: ' Phần thưởng đã được sử dụng.',
  NON_REFERRAL_PROCESSING: 'Phần thưởng sẽ có hiệu lực sau khi định danh eKYC.',
  KYC_SUCCESS: 'KYC thành công.',
  ACCOUNT_CLAIM_EVENT: 'Bạn đã nhận được $value Satoshi',
  [CASHBACK_STATUS.PROCESSING]: ' Giao dịch đang được xử lý.',
  [CASHBACK_STATUS.SUCCESS]: ' Giao dịch thành công.',
  [CASHBACK_STATUS.FAILURE]: ' Giao dịch xử lý thất bại.',
  [CASHBACK_STATUS.REJECTED]: ' Giao dịch không được xử lý.',
  [CASHBACK_STATUS.APPROVED]: ' Giao dịch đã được duyệt xử lý.',
  REFERRAL: {
    [CASHBACK_STATUS.PROCESSING]:
      'Phần thưởng sẽ có hiệu lực sau khi người được giới thiệu định danh eKYC.',
    [CASHBACK_STATUS.SUCCESS]: 'Phần thưởng đã được cộng vào ví cashback.',
    REFERRAL_BY_KYC_SUCCESS: 'Đã nhận $value SAT do $name kyc thành công',
  },
};

export const COMMON_TITLE = {
  KYC: 'Định danh KYC',
  DEPOSIT: 'Nạp tiền vào ví Bitback.',
  PAYMENT: 'Thanh toán đơn hàng.',
  PARTNER_VNDC_PAYMENT: 'Thanh toán mua VNDC',
  PARTNER_SAT_PAYMENT: 'Thanh toán mua Satoshi',
  PARTNER_PAYMENT: 'Thanh toán mua $currency',
  PAYME_PAYMENT: 'Nạp $currency vào ví Bitback',
  COIN_EXCHANGE: 'Quy đổi coin',
  CF_TRANSACTION: {
    [CHICKEN_FARM_TRANSACTION_TYPE.BONUS_CHICKEN_EGG]:
      'Thưởng trứng ấp từ Bitback. ',
    [CHICKEN_FARM_TRANSACTION_TYPE.COMMISSION_GOLDEN_EGG]:
      'Thưởng trứng vàng từ người được giới thiệu.',
  },
  [CASHBACK_TYPE.EXCHANGE]: 'Giao dịch đổi thưởng.',
  [CASHBACK_TYPE.INCOMING_OFF_CHAIN]: 'Cashback Off-chain',
  [CASHBACK_TYPE.INCOMING_ON_CHAIN]: 'Cashback On-chain',
  [CASHBACK_TYPE.OUTGOING_OFF_CHAIN]: 'Cashback Off-chain',
  [CASHBACK_TYPE.OUTGOING_ON_CHAIN]: 'Cashback On-chain.',
  [CASHBACK_TYPE.PAYMENT]: 'Giao dịch mua hàng.',
  [CASHBACK_TYPE.REFERRAL]: 'Giới thiệu ứng dụng Bitback.',
  [CASHBACK_TYPE.NON_REFERRAL]: 'Đăng ký ứng dụng Bitback.',
  [CASHBACK_TYPE.DAILY_REWARD]: 'Vòng quay may mắn hằng ngày.',
  [CASHBACK_TYPE.PARTNER_COMMISSION]: 'Hoa hồng hằng tháng.',
  [CASHBACK_TYPE.BUY_EGG_EVENT]: 'Mua trứng từ Bitback.',
  [CASHBACK_TYPE.BUY_EGG_P2P]: 'Giao dịch thành công từ chợ P2P.',
  [CASHBACK_TYPE.BUY_HEN_P2P]: 'Mua gà mái từ chợ P2P.',
  [CASHBACK_TYPE.SELL_GOLDEN_EGG]: 'Bán trứng vàng cho Bitback',
  [CASHBACK_TYPE.SELL_HEN_P2P]: 'Bán gà mái trên chợ P2P.',
  [CASHBACK_TYPE.SELL_EGG]: 'Bán trứng ấp trên chợ P2P.',
  [CASHBACK_TYPE.BUY_EXTRA_SLOT]: 'Mở rộng trang trại.',
  [CASHBACK_TYPE.BUY_ROOSTER_P2P]: 'Mua gà trống từ chợ P2P.',
  [CASHBACK_TYPE.SELL_ROOSTER_P2P]: 'Bán gà trống trên chợ P2P.',
  [CASHBACK_TYPE.BREED_CHICKEN]: 'Phối giống.',
  [CASHBACK_TYPE.INTEREST_PAYMENT]: 'Trả lãi.',
  [CASHBACK_TYPE.AWARD_REFERRAL_RANKING]:
    'Trả thưởng bảng xếp hạng giới thiệu.',
};

export const COMMON_DESCRIPTION = {
  CASHBACK: {
    PENDING: 'Giao dịch đang được xử lý.',
    SUCCESS: 'Giao dịch đổi thưởng thành công.',
    AMOUNT_INVALID: 'Số tiền khả dụng không trùng khớp với các giao dịch.',
    SEND_VNDC_FAILED: 'Đổi thưởng từ ví VNDC thất bại.',
    DAILY_REWARD: 'Thưởng từ vòng quay may mắn. Giá trị $value% đơn hàng',
  },
};

export const replaceMarkup = (template = '', params = {}) => {
  return Object.keys(params).reduce(
    (prev, key) => prev.replace(`$${key}`, params[key] || ''),
    template,
  );
};
