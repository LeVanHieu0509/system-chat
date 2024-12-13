import { CachingService } from '@app/caching';
import { STATUS } from '@app/common';
import { MainRepo } from '@app/repositories/main.repo';

import { UtilsService } from '@app/utils';
import { ForbiddenException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { T3RD_ENCRYPT_DECRYPT_KEY } from 'libs/config';

type CacheData = { uuid: string; name: string };
export async function validateAPIKey(
  apiKey: string,
  path: string,
  repo: MainRepo,
) {
  try {
    const cache = await CachingService.getInstance().get<CacheData>(apiKey);
    if (cache && validatePermission(path, cache.name)) {
      return cache.uuid;
    }

    const uuid = UtilsService.getInstance().decryptByCrypto<string>(
      apiKey,
      T3RD_ENCRYPT_DECRYPT_KEY,
    );
    if (!isUUID(uuid)) throw new ForbiddenException();

    const account = await repo.getAccount().findFirst({
      where: { id: uuid, status: STATUS.ACTIVE },
      select: { fullName: true },
    });
    if (!account || !validatePermission(path, account.fullName))
      throw new ForbiddenException();
    CachingService.getInstance().set(apiKey, { uuid, name: account.fullName });
    return uuid;
  } catch (error) {
    throw new ForbiddenException();
  }
}

function validatePermission(path: string, name: string) {
  // TODO permission will be set from CMS
  if (path.includes('onus') && !name.match(/onus|vndc/i)) return false;

  if (path.includes('bit-play') && !name.match(/bitarcade|bitplay|bit play/i))
    return false;
  return true;
}
