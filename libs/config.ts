import * as dotenv from 'dotenv';

dotenv.config();
const getString = (name: string) => process.env[name];
const getNumber = (name: string) => +process.env[name];

export const TIME_TO_LIMIT = getNumber('TIME_TO_LIMIT');
export const REQUEST_LIMIT = getNumber('REQUEST_LIMIT');
