import * as dotenv from 'dotenv';

dotenv.config();
const getString = (name: string) => process.env[name];
const getNumber = (name: string) => +process.env[name];

/** Computed */
export const ACCESS_TRACE_KEY = getString('ACCESS_TRACE_KEY');
export const ACCESS_TRACE_KEY_V2 = getString('ACCESS_TRACE_KEY_V2');
export const ACCESS_TRADE_SUFFIX = getString('ACCESS_TRADE_SUFFIX');
export const ACCESS_TRADE_TRANSACTION = getString('ACCESS_TRADE_TRANSACTION');
export const ACCOUNT_DEFAULT_PASSCODE = getString('ACCOUNT_DEFAULT_PASSCODE');
export const AMOUNT_MIN_HOLD = getNumber('AMOUNT_MIN_HOLD');
export const AMOUNT_REFERRAL_BY = getNumber('AMOUNT_REFERRAL_BY');
export const AMOUNT_REFERRAL_FROM = getNumber('AMOUNT_REFERRAL_FROM');
export const AMOUNT_SEND_OFF_CHAIN_MAX = getNumber('AMOUNT_SEND_OFF_CHAIN_MAX');
export const AMOUNT_SEND_OFF_CHAIN_MAX_DAY = getNumber(
  'AMOUNT_SEND_OFF_CHAIN_MAX_DAY',
);
export const AMOUNT_SEND_OFF_CHAIN_MAX_MONTH = getNumber(
  'AMOUNT_SEND_OFF_CHAIN_MAX_MONTH',
);
export const AMOUNT_SEND_OFF_CHAIN_MIN = getNumber('AMOUNT_SEND_OFF_CHAIN_MIN');
export const AWS_S3_ACCESS_KEY_ID = getString('AWS_S3_ACCESS_KEY_ID');
export const AWS_S3_ENDPOINT = getString('AWS_S3_ENDPOINT');
export const AWS_S3_REGION = getString('AWS_S3_REGION');
export const AWS_S3_SECRET_ACCESS_KEY = getString('AWS_S3_SECRET_ACCESS_KEY');
export const BITBACK_CMS_DOMAIN = getString('BITBACK_CMS_DOMAIN');
export const BITBACK_DOMAIN = getString('BITBACK_DOMAIN');
export const CACHE_MAX = getNumber('CACHE_MAX');
export const CACHE_TTL = getNumber('CACHE_TTL');
export const CALCULATE_INTEREST_RATE_CRON_EXPRESSION = getString(
  'CALCULATE_INTEREST_RATE_CRON_EXPRESSION',
);
export const CMS_DEFAULT_PASSWORD = getString('CMS_DEFAULT_PASSWORD');
export const CMS_JWT_EXPIRATION_TIME = getNumber('CMS_JWT_EXPIRATION_TIME');
export const CMS_JWT_SECRET_KEY = getString('CMS_JWT_SECRET_KEY');
export const DATABASE_LOG = getString('DATABASE_LOG');
export const DATABASE_URL = getString('DATABASE_URL');
export const ELASTIC_APM_ENABLE = getString('ELASTIC_APM_ENABLE');
export const ELASTIC_APM_SERVER_URL = getString('ELASTIC_APM_SERVER_URL');
export const ELASTIC_APM_SERVICE_NAME = getString('ELASTIC_APM_SERVICE_NAME');
export const JWT_EXPIRATION_TIME = getNumber('JWT_EXPIRATION_TIME');
export const JWT_REFRESH_TOKEN_EXPIRATION_TIME = getNumber(
  'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
);
export const JWT_REFRESH_TOKEN_KEY = getString('JWT_REFRESH_TOKEN_KEY');
export const JWT_SECRET_KEY = getString('JWT_SECRET_KEY');
export const KARDIA_ADMIN_WALLET = getString('KARDIA_ADMIN_WALLET');
export const KARDIA_ENDPOINT = getString('KARDIA_ENDPOINT');
export const KARDIA_FROM_WALLET = getString('KARDIA_FROM_WALLET');
export const KARDIA_MAIN_RPC = getString('KARDIA_MAIN_RPC');
export const KARDIA_PRIVATE_KEY = getString('KARDIA_PRIVATE_KEY');
export const MAX_INTEREST_RATE = getNumber('MAX_INTEREST_RATE');
export const MAX_SIZE_UPLOAD_IMAGE = getNumber('MAX_SIZE_UPLOAD_IMAGE');
export const MAX_SIZE_UPLOAD_VIDEO = getNumber('MAX_SIZE_UPLOAD_VIDEO');
export const PAY_ME_BE_ACCESS_TOKEN = getString('PAY_ME_BE_ACCESS_TOKEN');
export const PAY_ME_BE_DEPOSIT_IPN_URL = getString('PAY_ME_BE_DEPOSIT_IPN_URL');
export const PAY_ME_BE_PRIVATE_KEY = getString('PAY_ME_BE_PRIVATE_KEY');
export const PAY_ME_BE_PUBLIC_KEY = getString('PAY_ME_BE_PUBLIC_KEY');
export const PAY_ME_BE_QUERY_PATH = getString('PAY_ME_BE_QUERY_PATH');
export const PAY_ME_BE_X_API_CLIENT = getString('PAY_ME_BE_X_API_CLIENT');
export const PAY_ME_SDK_SECRET_KEY = getString('PAY_ME_SDK_SECRET_KEY');
export const PAY_ME_STORE_ID = getString('PAY_ME_STORE_ID');
export const PAY_ME_URL = getString('PAY_ME_URL');
export const QUEUE_HOST = getString('QUEUE_HOST');
export const REDIS_HOST = getString('REDIS_HOST');
export const REDIS_PASS = getString('REDIS_PASS');
export const REDIS_PORT = getNumber('REDIS_PORT');
export const REFERRAL_CODE_LENGTH = getNumber('REFERRAL_CODE_LENGTH');
export const REQUEST_LIMIT = getNumber('REQUEST_LIMIT');
export const RESET_PASSCODE_PRIVATE_KEY = getString(
  'RESET_PASSCODE_PRIVATE_KEY',
);
export const S3_BUCKET_NAME = getString('S3_BUCKET_NAME');
export const SEND_INTEREST_PAYMENT_NOTIFICATION_CRON_EXPRESSION = getString(
  'SEND_INTEREST_PAYMENT_NOTIFICATION_CRON_EXPRESSION',
);
export const SENDGRID_ACCOUNT_INFO = getString('SENDGRID_ACCOUNT_INFO');
export const SENDGRID_API_KEY = getString('SENDGRID_API_KEY');
export const SENDGRID_FG_PASS_LINK = getString('SENDGRID_FG_PASS_LINK');
export const SENDGRID_FG_PASS_SUBJECT = getString('SENDGRID_FG_PASS_SUBJECT');
export const SENDGRID_OTP_SUBJECT = getString('SENDGRID_OTP_SUBJECT');
export const SENDGRID_RESET_PASSCODE = getString('SENDGRID_RESET_PASSCODE');
export const SENDGRID_SENDER = getString('SENDGRID_SENDER');
export const T3RD_ENCRYPT_DECRYPT_KEY = getString('T3RD_ENCRYPT_DECRYPT_KEY');
export const TIME_TO_LIMIT = getNumber('TIME_TO_LIMIT');
export const VNDC_AMOUNT_EXCHANGE_FEE = getNumber('VNDC_AMOUNT_EXCHANGE_FEE');
export const VNDC_AMOUNT_EXCHANGE_MAX = getNumber('VNDC_AMOUNT_EXCHANGE_MAX');
export const VNDC_AMOUNT_EXCHANGE_MAX_DAY = getNumber(
  'VNDC_AMOUNT_EXCHANGE_MAX_DAY',
);
export const VNDC_AMOUNT_EXCHANGE_MAX_MONTH = getNumber(
  'VNDC_AMOUNT_EXCHANGE_MAX_MONTH',
);
export const VNDC_AMOUNT_EXCHANGE_MIN = getNumber('VNDC_AMOUNT_EXCHANGE_MIN');
export const VNDC_AMOUNT_MIN_HOLD = getNumber('VNDC_AMOUNT_MIN_HOLD');
export const VNDC_CHECK_INFO = getString('VNDC_CHECK_INFO');
export const VNDC_COUNT_USER = getString('VNDC_COUNT_USER');
export const VNDC_KEY = getString('VNDC_KEY');
export const VNDC_SEND_OFF_CHAIN = getString('VNDC_SEND_OFF_CHAIN');
export const VNDC_TRANSACTION_DETAIL = getString('VNDC_TRANSACTION_DETAIL');

/** Computed */
export const DEPOSIT_IPN_URL = BITBACK_DOMAIN + PAY_ME_BE_DEPOSIT_IPN_URL;
export const RABBITMQ_URLS = QUEUE_HOST.split(',');
export const NODE_ENV = getString('NODE_ENV') || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
