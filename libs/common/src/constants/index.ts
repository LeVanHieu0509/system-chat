export enum QUEUES {
  AUTHENTICATOR = 'AUTHENTICATOR_QUEUE',
  CASHBACK = 'CASHBACK_QUEUE',
  MINIGAME = 'MINIGAME_QUEUE',
  BITFARM = 'BITFARM_QUEUE',
  WALLET = 'WALLET_QUEUE',
  BITLOT = 'BITLOT_QUEUE',
}

export enum MobileVersion {
  '1.3.5' = '1.3.5',
  '1.4.1' = '1.4.1',
  '2.0.0' = '2.0.0',
}

export enum OTP_TYPE {
  SIGN_UP = '1',
  CASHBACK = '2',
  PAYMENT = '3',
  RESET_PASSCODE = '4',
  VERIFY_EMAIL = '5',
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum RoleType {
  ADMIN = 1,
  MANAGER = 2,
  EDITOR = 3,
  USER = 4,
}

export enum AccountType {
  BROKER = 'BROKER',
  USER = 'USER',
}

export class CommonConstants {
  static readonly ORDER = Order;
  static readonly ROLE_TYPE = RoleType;
}

export enum STATUS {
  INACTIVE = 0,
  ACTIVE = 1,
}

export enum CASHBACK_TYPE {
  INCOMING_ON_CHAIN = 1,
  INCOMING_OFF_CHAIN = 2,
  OUTGOING_ON_CHAIN = 3,
  OUTGOING_OFF_CHAIN = 4,
  EXCHANGE = 5,
  PAYMENT = 6,
  REFERRAL = 7,
  DAILY_REWARD = 8,
  PARTNER_COMMISSION = 9,
  NON_REFERRAL = 10,
  PARTNER_BONUS = 11,
  ACCOUNT_EVENT = 12,
  BUY_EGG_EVENT = 13,
  SELL_GOLDEN_EGG = 14,
  SELL_EGG = 16,
  BUY_EGG_P2P = 17,
  BUY_HEN_P2P = 18,
  SELL_HEN_P2P = 19,
  BUY_EXTRA_SLOT = 20,
  EXCHANGE_COIN_OUT = 21,
  EXCHANGE_COIN_IN = 22,
  BIT_PLAY_SEND_PURCHASE = 23,
  BIT_PLAY_RECEIVE_REWARD = 24,
  ONUS_PAYMENT = 25,
  BANK_TRANSFER = 26,
  BUY_ROOSTER_P2P = 27,
  SELL_ROOSTER_P2P = 28,
  BREED_CHICKEN = 29,
  INTEREST_PAYMENT = 30,
  BBC_PURCHASE = 31,
  AWARD_REFERRAL_RANKING = 32,
  BITLOT_LUCKY_NUMBER = 33,
}

export enum CASHBACK_BROKER_TYPE {
  BIT_PLAY_RECEIVE_PURCHASE = 1,
  BIT_PLAY_SEND_REWARD = 2,
  DEPOSIT = 3,
  ONUS_PAYMENT = 4,
  BBC_RECEIVE_PURCHASE = 5,
  BONUS_EVENT = 6,
}

export enum CASHBACK_ACTION_TYPE {
  SUBTRACT = -1,
  ADD = 1,
}

export enum PARTNER_TYPE {
  VNDC = 1,
  INTER_LOAN = 2,
  GOT_IT = 3,
  FAM_CENTRAL = 4,
}

export enum CASHBACK_STATUS {
  PROCESSING = 1,
  SUCCESS = 2,
  FAILURE = 3,
  REJECTED = 4,
  APPROVED = 5,
}

export const MESSAGE_PATTERN = {
  HEALTH_CHECK: 'health_check',
  AUTH: {
    FIND_ACCOUNT: 'bitback-auth-find-account',
    SIGN_IN: 'bitback-auth-sign-in',
    SIGN_IN_WITH_GOOGLE: 'bitback-auth-sign-in-with-google',
    SIGN_IN_WITH_FACEBOOK: 'bitback-auth-sign-in-with-facebook',
    SIGN_IN_WITH_APPLE: 'bitback-auth-sign-in-with-apple',
    SIGN_UP: 'bitback-auth-sign-up',
    SIGN_UP_VERIFY_PASSCODE: 'bitback-auth-sign-up-verify-passcode',
    SIGN_IN_VERIFY_PASSCODE: 'bitback-auth-sign-in-verify-passcode',
    VERIFY_PASSCODE: 'bitback-auth-verify-passcode',
    REQUEST_OTP: 'bitback-auth-request-otp',
    VERIFY_OTP: 'bitback-auth-verify-otp',
    CHECK_PHONE: 'bitback-auth-check-phone',
    RESET_PASSCODE: 'bitback-auth-reset-passcode',
    GET_PROFILE: 'bitback-auth-get-profile',
    EDIT_PROFILE: 'bitback-auth-edit-profile',
    CHANGE_EMAIL: 'bitback-auth-change-email',
    CONFIRM_EMAIL: 'bitback-auth-change-email-confirm',
    CHANGE_PHONE: 'bitback-auth-change-phone',
    CONFIRM_PHONE: 'bitback-auth-change-phone-confirm',
    CHANGE_PASSCODE: 'bitback-auth-change-passcode',
    REFERRAL: 'bitback-auth-account-referral',
    GET_REFERRAL_BY_ACCOUNT: 'bitback-auth-insert-get-referral-by-account',
    GET_TOTAL_REFERRAL_KYC_BY_ACCOUNT:
      'bitback-auth-get-total-referral-kyc-by-account',
    SYNC_CONTACT: 'bitback-auth-sync-contact',
    GET_CONTACT: 'bitback-auth-get-contact',
    PROFILE_SETTING: 'bitback-auth-update-setting-account',
    UPDATE_ACCOUNT_SETTING: 'bitback-auth-update-account-setting',
    NOTIFICATION: 'bitback-auth-account-notification',
    SEEN_NOTIFICATION: 'bitback-auth-account-seen-notification',
    COUNT_NOTIFICATION: 'bitback-auth-account-count-notification',
    READ_ALL_NOTIFICATIONS: 'bitback-auth-account-read-all-notifications',
    TRANS_HISTORY: 'bitback-auth-get-transaction-history',
    DEVICE_TOKEN: 'bitback-auth-update-device-token',
    KYC_SUBMIT: 'bitback-auth-kyc-submit',
    KYC_CHANGE_STATUS: 'bitback-auth-kyc-change-status',
    BANNERS: 'bitback-auth-banners',
    BANNERS_V2: 'bitback-auth-banners-v2',
    ADS_BANNER: 'bitback-auth-ads-banner',
    ADS_BANNER_V2: 'bitback-auth-ads-banner-v2',
    VALIDATE_SIGN_UP: 'bitback-auth-validate-new-account',
    SAVE_NEW_ACCOUNT: 'bitback-auth-save-new-account',
    GET_TOTAL_COMMISSION: 'bitback-auth-get-total-commission',
    GET_COMMISSION_HISTORIES: 'bitback-auth-get-commission-histories',
    GET_TOTAL_COMMISSION_V2: 'bitback-auth-get-total-commission-v2',
    GET_COMMISSION_HISTORIES_V2: 'bitback-auth-get-commission-histories-v2',
    CHECK_REFERRAL_CODE: 'bitback-auth-check-referral-code',
    PRE_CHECK_PHONE: 'bitback-auth-pre-check-phone',
  },
  MINIGAME: {
    GET_LUCKY_WHEEL: 'bitback-minigame-get-lucky-wheel',
    GET_DAILY_LUCKY_WHEEL: 'bitback-minigame-get-daily-lucky-wheel',
    SUBMIT_DAILY_LUCKY_WHEEL: 'bitback-minigame-submit-daily-lucky-wheel',
    GET_ACCOUNT_EVENT_V2: 'bitback-minigame-get-account-event-v2',
    SUBMIT_ACCOUNT_EVENT_V2: 'bitback-minigame-submit-account-event-v2',
    GET_CHALLENGE: 'bitback-minigame-get-challenge',
    GET_CHALLENGE_DETAIL: 'bitback-minigame-get-challenge-detail',
    GET_CHALLENGE_RANKING: 'bitback-minigame-get-challenge-ranking',
    SUBMIT_BIT_PLAY_SCORE: 'bitback-minigame-bit-play-submit-score',
  },
  CASHBACK: {
    EXCHANGE: 'bitback-cashback-exchange',
    EXCHANGE_INQUIRY: 'bitback-cashback-exchange-inquiry',
    EXCHANGE_PASSCODE: 'bitback-cashback-exchange-verify-passcode',
    EXCHANGE_OTP: 'bitback-cashback-exchange-verify-otp',
    EXCHANGE_CONFIRM: 'bitback-cashback-exchange-verify-confirm',
    EXCHANGE_WALLETS: 'bitback-cashback-exchange-wallets',
    CASHBACK_LIST: 'bitback-cashback-list',
    CASHBACK_EXCHANGE_RATE: 'bitback-cashback-exchange-rate',
    CASHBACK_INQUIRY: 'bitback-cashback-off-chain-inquiry',
    CASHBACK_OFF_CHAIN_PASSCODE: 'bitback-cashback-off-chain-passcode',
    CASHBACK_OFF_CHAIN_OTP: 'bitback-cashback-off-chain-otp',
    CASHBACK_OFF_CHAIN_CONFIRM: 'bitback-cashback-off-chain-confirm',
    CASHBACK_OFF_CHAIN_TRANSFER: 'bitback-cashback-off-chain-transfer',
    INTRODUCE: 'bitback-cashback-introduce',
    EXCHANGE_INQUIRY_V2: 'bitback-cashback-exchange-inquiry-v2',
    EXCHANGE_V2: 'bitback-cashback-exchange-v2',
    COIN_LIST: 'bitback-cashback-coin-list',
    CASHBACK_MULTIPLE_COIN: 'bitback-cashback-multiple-coin',
    EXCHANGE_COIN: 'bitback-cashback-exchange-coin',
    VNDC_EXCHANGE: 'bitback-cashback-vndc-exchange',
    VNDC_EXCHANGE_INQUIRY: 'bitback-cashback-vndc-exchange-inquiry',
    VNDC_EXCHANGE_PASSCODE: 'bitback-cashback-vndc-exchange-verify-passcode',
    TRANSFER_VNDC: 'bitback-cashback-transfer-vndc',
    ONUS_TRANSACTIONS: 'bitback-cashback-onus-transactions',
    MASTER_CONFIG: 'bitback-cashback-master-config',
  },
  CASHBACK_EXCHANGE_V3: {
    INQUIRY: 'bitback-cashback-exchange-v3-inquiry',
    VERIFY_PASSCODE: 'bitback-cashback-exchange-v3-verify-passcode',
    SUBMIT: 'bitback-cashback-exchange-v3-submit',
  },
  CAMPAIGN: {
    DETAIL: 'bitback-campaign-detail',
    LIST: 'bitback-campaign-list',
    CATEGORY: 'bitback-campaign-category',
  },
  VNDC: {
    BUY_VNDC: 'bitback-buy-vndc',
    CHECK_TRANSACTION: 'bitback-check-transaction',
    CREATE_BUY_VNDC_TRANSACTION: 'bitback-create-buy-vndc-transaction',
    GET_TRANSACTION: 'bitback-get-transaction',
    CANCEL_TRANSACTION: 'bitback-cancel-transaction',
    PAYMENT_IPN: 'bitback-payment-ipn',
    DEPOSIT_PAYME: 'bitback-deposit-payme',
    DEPOSIT_PAYME_IPN: 'bitback-deposit-payme-ipn',
    UPDATE_STATUS_TRANSACTION: 'bitback-update-status-transaction',
    KYC_IPN: 'bitback-kyc-ipn',
  },
  QUEUE_CHICKEN_FARM: {
    GET_MASTER_CONFIG: 'bitback-chicken-farm-get-master-config',
    CLAIM_CHICKEN: 'bitback-chicken-farm-claim-chicken',
    CLAIM_EGG: 'bitback-chicken-farm-claim-egg',
    SELL_EGG: 'bitback-chicken-farm-sell-egg',
    SELL_CHICKEN_P2P: 'bitback-chicken-farm-sell-chicken-p2p',
    GET_CHICKEN_OFFER_PRICE: 'bitback-chicken-farm-get-chicken-offer-price',
    P2P_MARKET: 'bitback-chicken-farm-p2p-market',
    BUY_ITEM_ON_P2P_MARKET: 'bitback-chicken-farm-buy-item-on-p2p-market',
    CHECK_ACCOUNT_VALID: 'bitback-chicken-farm-event-check-account-valid',
    BUY_EGG_CONSUMER: 'bitback-chicken-farm-buy-egg-consumer',
    GET_CHICKEN_EGG: 'bitback-chicken-farm-get-chicken-egg',
    GET_CHICKEN_GAME_PROFILE: 'bitback-chicken-farm-get-chicken-game-profile',
    GET_CHICKEN_ADULT: 'bitback-chicken-farm-get-chicken-adult',
    GET_CHICKEN_ADULT_DETAIL: 'bitback-chicken-farm-get-chicken-adult-detail',
    SELL_GOLDEN_EGG: 'bitback-chicken-farm-sell-golden-egg',
    CANCEL_SELLING: 'bitback-chicken-farm-cancel-selling',
    GET_TRANSACTION: 'bitback-chicken-farm-get-transactions',
    CHECK_OPEN: 'bitback-chicken-farm-check-open',
    EVENT_POPUPS: 'bitback-chicken-farm-event-popups',
    GET_PRICE_EXTRA_SLOT: 'bitback-chicken-farm-get-price-extra-slot',
    BUY_EXTRA_SLOT: 'bitback-chicken-farm-buy-extra-slot',
    GET_RANKING: 'bitback-chicken-farm-get-ranking',
    BREED: 'bitback-chicken-farm-breed',
    CHICKEN_CAN_BREED: 'bitback-chicken-farm-can-breed',
    CHICKEN_BREEDING: 'bitback-chicken-farm-breeding',
    CLAIM_BREED: 'bitback-chicken-farm-claim-breed',
    CHICKEN_BREEDING_BY_ID: 'bitback-chicken-farm-breeding-by-id',
    GET_GOLDEN_EGG_EXCHANGE_RATE:
      'bitback-chicken-farm-get-golden-egg-exchange-rate',
    POOL_RATE: 'bitback-chicken-farm-pool-rate',
  },
  EVENT: {
    REFERRAL_RANKING: 'bitback-event-referral-ranking',
    REFERRAL_RANKING_MY_RANK: 'bitback-event-referral-ranking-my-rank',
    REFERRAL_RANKING_ACCOUNTS: 'bitback-event-referral-ranking-accounts',
    OLD_RANKING: 'bitback-event-old-ranking',
  },
  WALLET: {
    INSERT_SWAP_COIN_TRANSACTION: 'bitback-wallet-insert-swap-coin-transaction',
    HOLD_BALANCE: 'bitback-wallet-hold-balance',
    REVERT_BALANCE: 'bitback-wallet-revert-balance',
    INSERT_BREED_CHICKEN_TRANSACTION:
      'bitback-wallet-insert-breed-chicken-transaction',
    MARKET_TRANSACTION: 'bitback-wallet-market-transaction',
    SELL_GOLDEN_EGG: 'bitback-wallet-sell-golden-egg',
    BUY_EGG_EVENT: 'bitback-wallet-buy-egg-event',
    BUY_EXTRA_SLOT: 'bitback-wallet-buy-extra-slot',
    USER_DEPOSIT: 'bitback-wallet-user-deposit',
    DAILY_LUCKY_WHEEL: 'bitback-wallet-daily-lucky-wheel',
    EARN_SATOSHI: 'bitback-wallet-earn-satoshi',
    APPROVE_KYC: 'bitback-wallet-approve-kyc',
    PARTNER_COMMISSION: 'bitback-wallet-partner-commission',
    INTEREST_PAYMENT: 'bitback-wallet-interest-payment',
    ACCOUNT_REFERRAL: 'bitback-wallet-account-referral',
    NONE_ACCOUNT_REFERRAL: 'bitback-wallet-none-account-referral',
    BROKER_PROCESS: 'bitback-wallet-broker-process',
    APPROVE_DAILY_LUCKY_WHEEL: 'bitback-wallet-approve-daily-lucky-wheel',
    AWARD_REFERRAL_RANKING: 'bitback-wallet-award-referral-ranking',
  },
} as const;

export const MAX_CASHBACK_TRANSACTION_CHECK = 100;

export const PAGINATION = {
  PAGE: 1,
  SIZE: 10,
};

export enum KYC_DOC_TYPE {
  IDENTITY_CARD = 1,
  CITIZEN_IDENTIFICATION = 2,
  PASSPORT = 3,
}

export enum KYC_STATUS {
  EMPTY = 0,
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
}

export const KYC_STATUS_IPN = {
  EMPTY: KYC_STATUS.EMPTY,
  PENDING: KYC_STATUS.PENDING,
  APPROVED: KYC_STATUS.APPROVED,
  REJECTED: KYC_STATUS.REJECTED,
};

export enum EXTERNAL_CAMPAIGN_TYPE {
  ACCESS_TRADE_CAMPAIGN = 1,
}

export const BITCOIN_CODE = 'BTC'; // Not used

export enum CURRENCY_CODE {
  SATOSHI = 'SAT',
  VNDC = 'VNDC',
  BAMI = 'BAMI',
  KAI = 'KAI',
  BBC = 'BBC',
}

export enum REFERRAL_TYPE {
  BY_ME = 1,
  FROM_ME = 2,
}

export enum SETTING_TYPE {
  NOTIFICATION_TRANSACTION = 1,
  NOTIFICATION_PROMOTION = 2,
}

export enum TRANSACTION_HISTORY_TYPE {
  PARTNER = 1,
  CASHBACk = 2,
}

export enum CONFIG_TYPE {
  CASHBACk_ON_CHAIN = 1,
  CASHBACk_OFF_CHAIN = 2,
  REWARD_REFERRAL_FROM = 3,
  REWARD_REFERRAL_BY = 4,
  REWARD_TRANSACTION = 5,
}

export enum CONFIG_UNIT {
  NONE = 0,
  PERCENT = 1,
}

export enum NOTIFICATION_TYPE {
  CB_REWARD = 0,
  CB_ON_CHAIN = 1,
  CB_OFF_CHAIN = 2,
  PAYMENT = 3,
  REFERRAL_FROM = 4,
  REFERRAL_BY = 5,
  KYC = 6,
  DEPOSIT = 7,
  DAILY_REWARD = 8,
  PARTNER_COMMISSION = 9,
  WALLET_PAYMENT = 10,
  NON_REFERRAL = 11,
  PARTNER_BONUS = 12,
  ACCOUNT_EVENT = 13,
  BUY_EGG = 14,
  SELL_GOLDEN_EGG = 15,
  BONUS_CHICKEN_EGG = 16,
  SELL_HEN_P2P = 17,
  COMMISSION_GOLDEN_EGG = 18,
  BUY_EGG_P2P = 19,
  BUY_HEN_P2P = 20,
  SEND_NOTIFICATION = 21,
  SELL_EGG = 22,
  BUY_EXTRA_SLOT = 23,
  BIT_PLAY_PURCHASE = 24,
  BIT_PLAY_REWARD = 25,
  ONUS_PAYMENT = 26,
  SELL_ROOSTER_P2P = 27,
  BUY_ROOSTER_P2P = 28,
  INTEREST_PAYMENT = 29,
  BBC_PURCHASE = 30,
  AWARD_REFERRAL_RANKING = 31,
}

export enum ACCESS_TRADE_TRANS_STATUS {
  HOLD = 0,
  APPROVED = 1,
  REJECTED = 2,
}

export enum MAX_LENGTH_COIN {
  BTC = 7,
  ETH = 5,
  XRP = 2,
  DGB = 6,
  MKR = 7,
  DOT = 2,
  VNDC = 3,
  LINK = 2,
  SOL = 2,
  SLM = 3,
  MATIC = 6,
  ETC = 6,
}

export enum UPLOAD_TYPE_APP {
  AVATAR = 1,
  KYC = 2,
}

export enum UPLOAD_TYPE_CMS {
  AVATAR = 3,
}

export const BITBACK_DOMAIN = 'bitback.vn';

export const REGEX_URL_PATTERN =
  /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)\//gim;

export const DEFAULT_EXPIRES_GET = 10;

export enum DASHBOARD_CHART_TYPE {
  DAY = 1,
  WEEK = 2,
  MONTH = 3,
}

export const VNDC_RESPONSE_OFF_CHAIN_CODE = {
  SUCCESS: 'success',
};

export const CAMPAIGN_PARAMS = {
  SOURCE: 'utm_source',
  MEDIUM: 'utm_medium',
  CAMPAIGN: 'utm_campaign',
  CONTENT: 'utm_content',
  SINCE: 'since',
  UNTIL: 'until',
  STATUS: 'status',
  TRANSACTION_ID: 'transaction_id',
};

export const PATH_CONTAIN_ID =
  '/:id([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})';

export const PAYMENT_AMOUNT_MIN = 10000;
export const PAYMENT_AMOUNT_MAX = 10000000;

export const PAY_ME_STATE = {
  SUCCEEDED: CASHBACK_STATUS.SUCCESS,
  FAILED: CASHBACK_STATUS.FAILURE,
  PENDING: CASHBACK_STATUS.PROCESSING,
  EXPIRED: CASHBACK_STATUS.REJECTED,
  CANCELED: 6,
  REFUNDED: 7,
};

export const PAY_ME_RESPONSE_CODE = {
  REQUEST_SUCCESS: 1000,
  REQUEST_FAIL: 1001,
};

export const ENCRYPT_CODE = {
  SUCCESS: 1,
  ERROR: -2,
};

export enum DAILY_LUCKY_WHEEL_TYPE {
  SATOSHI = 1,
  PAYMENT = 2,
  NONE = 3,
}

export enum SORT_KEY_LUCKY_WHEEL {
  NO_PRIZE = 'noPrize',
  PRIZE_50 = 'prize50',
  PRIZE_100 = 'prize100',
  PRIZE_200 = 'prize200',
  PRIZE_300 = 'prize300',
  PRIZE_400 = 'prize400',
  PRIZE_500 = 'prize500',
  PRIZE_1000 = 'prize100',
  TOTAL_USERS = 'totalUsers',
  TOTAL_SAT = 'totalSAT',
  DATE = 'date',
}

export enum PAYMENT_LUCKY_WHEEL_TYPE {
  DOUBLE_CASHBACK = 1,
  DOUBLE_BALANCE = 2,
  PAYMENT = 3,
  CASHBACK_PAYMENT = 4,
}

export enum ACCOUNT_LUCKY_WHEEL_STATUS {
  NEW = 1,
  USED = 2,
  EXPIRED = 3,
}

export const MAX_NUMBER_ROW_INSERT = 100000;
export const MAX_QUOTA_DEVICE_TOKEN = 1000;

export const EXPIRATION_REWARD = 24;

export const BTC_UNIT = 100000000;

export const TIME_ZONE_VN = 'Asia/Ho_Chi_Minh';

export const GMT_7 = 7 * 60 * 60 * 1000;

export const COMMISSION_RATE = [
  { min: 1, max: 199999999, value: 0.5 },
  { min: 200000000, max: 299999999, value: 0.55 },
  { min: 300000000, max: 399999999, value: 0.6 },
  { min: 400000000, max: 499999999, value: 0.65 },
  { min: 500000000, value: 0.7 },
];

export const REWARD_NON_REFERRAL = 1000; // satoshi

export const CONFIG_EVENT_STATUS = {
  NEW: 'NEW',
  RUNNING: 'RUNNING',
  FINISH: 'FINISH',
};
export enum ACCOUNT_EVENT_STATUS {
  PROCESSING = 1,
  SUCCESS = 2,
  REJECTED = 3,
}

export enum TIME_QUERY_USER_VNDC {
  DAY = 1,
  WEEK = 2,
  MONTH = 3,
  NONE = 4,
}
export enum STATISTICS_BUY_SATOSHI_TIME {
  THIS_MONTH = 1,
  LAST_MONTH = 2,
  ALL = 3,
}

export enum CHICKEN_FARM_EGG_EVENT_STATUS {
  RUNNING = 1,
  PENDING = 2,
  FINISH = 3,
}
export enum CHICKEN_FARM_STATUS {
  LIVING = 1,
  EXPIRED = 2,
}
export enum CHICKEN_FARM_MARKET_STATUS {
  PENDING = 1,
  SUCCESS = 2,
}

export enum PARTNER_TRANS_TYPE {
  INCOMING = 1,
  OUTGOING = 2,
}

export const MIN_REWARD_EVENT = 10;

export const PERCENT_EXCHANGE_RATE_SAT = 0.95;

export const MIN_EGG_HARVEST = 100;

export enum CHICKEN_FARM_P2P_MARKET_TYPE {
  EGG = 1,
  HEN = 2,
  ROOSTER = 3,
  ROOSTER_EGG = 4,
}

export enum CHICKEN_FARM_TRANSACTION_TYPE {
  GOLDEN_EGG = 1,
  EGG = 2,
  HEN = 3,
  BONUS_CHICKEN_EGG = 4,
  COMMISSION_GOLDEN_EGG = 5,
  ROOSTER = 6,
}

export enum CHICKEN_TYPE {
  HEN = 1,
  ROOSTER = 2,
}

export const GOLDEN_EGG_FOR_PARTNER = 0.05;

export const MAX_CONNECTION_POOL = 5;

export const TOTAL_EGG_DEFAULT = 1000;

export const P2P_MARKET_AMOUNT_MIN = 40;
export const P2P_MARKET_AMOUNT_MAX = 1000000;
export const P2P_MARKET_AMOUNT_STEP = 10;

export enum CHICKEN_FARM_P2P_MARKET_FEE_TYPE {
  PERCENT = 1,
  FIXED,
}

export const P2P_MARKET_FEE_PERCENT = 0.5;
export const P2P_MARKET_FEE_FIXED = 4;

export enum CB_EXCHANGE_TYPE {
  SAT = 1,
  VNDC = 2,
  FAM = 3,
  BAMI = 4,
  KAI = 5,
  ATTLAS = 6,
}

export enum BIT_PLAY_CHALLENGE_STATUS {
  RUNNING = 1,
  PENDING = 2,
  FINISH = 3,
  PAID_OUT = 4,
}

export enum EVENT_STATUS {
  ACTIVE = 1,
  INACTIVE = 2,
}

export const LATEST_VERSION = 'latest';

export enum CHICKEN_FARM_EVENT_STATUS {
  HIDE,
  SHOW,
}

export enum ADS_STATUS {
  HIDE,
  SHOW,
}

export enum CHICKEN_ADULT_TYPE {
  MARS = 1,
  JUPITER = 2,
  VENUS = 3,
  MERCURY = 4,
  SATURN = 5,
}

export const CHICKEN_TYPE_PREFIX = {
  [CHICKEN_ADULT_TYPE.MARS]: 'MA',
  [CHICKEN_ADULT_TYPE.JUPITER]: 'JU',
  [CHICKEN_ADULT_TYPE.VENUS]: 'VE',
  [CHICKEN_ADULT_TYPE.MERCURY]: 'ME',
  [CHICKEN_ADULT_TYPE.SATURN]: 'SA',
};

export const REFERRAL_RANKING_LIMIT = 100;

export enum REFERRAL_RANKING_STATUS {
  HAPPENING = 1,
  LOCKED,
  AWARDED,
}

export enum EXCHANGE_METHOD {
  ONUS = 'ONUS',
}

export enum CurrencyLimitSettingType {
  WITHDRAW = 1,
  SWAP = 2,
}

export enum BONUS_EVENT_STATUS {
  NEW = 'NEW',
  PROCESSING = 'PROCESSING',
  FINISH = 'FINISH',
}
