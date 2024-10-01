import { CustomDecorator, HttpException, SetMetadata } from '@nestjs/common';
import { AuthUser } from './auth-user.decorator';
import { ToArrayString, ToBoolean } from './transforms.decorator';
import { KYC_STATUS, RoleType } from '../constants';

export class DECORATOR {
  static readonly AuthUser = AuthUser;
}

export const Public = (): CustomDecorator<string> => {
  return SetMetadata('isPublic', true);
};

export const KYC = (status = KYC_STATUS.APPROVED): CustomDecorator<string> => {
  return SetMetadata('kycStatus', status);
};

export function Roles(...roles: RoleType[]): CustomDecorator<string> {
  return SetMetadata('roles', roles);
}

type RedlockType = {
  key: string;
  error: HttpException;
  uuid?: boolean;
  ipn?: boolean;
  thirdParty?: boolean;
};
export function RedlockMeta(meta: RedlockType): CustomDecorator<string> {
  return SetMetadata('redlock', { uuid: true, ...meta });
}

export { ToBoolean, ToArrayString };
