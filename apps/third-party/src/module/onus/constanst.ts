import { VALIDATE_MESSAGE } from '@app/common/validate-message';

export const ONUS_ERROR: Record<string, string> = Object.freeze({
    [VALIDATE_MESSAGE.ACCOUNT.ACCOUNT_INVALID]: 'Account is not valid',
    [VALIDATE_MESSAGE.CASHBACK.TRANSACTION_INVALID]: 'Transaction is not valid',
    [VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID]: 'Insufficient balance available',
    [VALIDATE_MESSAGE.CASHBACK.COIN_INVALID]: 'Currency is not valid',
    [VALIDATE_MESSAGE.CASHBACK.AMOUNT_INVALID_MIN]: 'Amount is too small',
    ACCOUNT_DISABLED: 'Account has been disabled',
    TRANSACTION_ALREADY_EXISTED: 'Transaction already existed',
    TRANSACTION_OUT_OF_DATE: 'Transaction is out of date',
    RECEIVER_INVALID: 'Receiver is not valid',
    INVALID_PAYLOAD: 'Invalid payload'
});
