import * as dotenv from 'dotenv';

dotenv.config();
const getString = (name: string) => process.env[name];
const getNumber = (name: string) => +process.env[name];

export const TIME_TO_LIMIT = getNumber('TIME_TO_LIMIT');
export const REQUEST_LIMIT = getNumber('REQUEST_LIMIT');
export const QUEUE_HOST = getString('QUEUE_HOST');

export const RABBITMQ_URLS = QUEUE_HOST.split(',');
export const NODE_ENV = getString('NODE_ENV') || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
