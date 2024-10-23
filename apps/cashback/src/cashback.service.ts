import { CURRENCY_CODE, MobileVersion, QUEUES, STATUS } from '@app/common';
import { VersionQueryDto } from '@app/dto/common';
import { MainRepo } from '@app/repositories/main.repo';
import { UtilsService } from '@app/utils';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';

@Injectable()
export class CashbackService {
  private readonly _logger: Logger = new Logger(CashbackService.name);

  constructor(
    @Inject(QUEUES.WALLET) private readonly _clientWallet: ClientProxy,
    private readonly _repo: MainRepo,
  ) {}

  async getCoinList(input: VersionQueryDto) {
    this._logger.log(
      `CashbackService --> getCoinList input: ${JSON.stringify(input)}`,
    );
    const { version } = input;
    const where: Prisma.CurrencyMasterWhereInput = {
      status: STATUS.ACTIVE,
      code: { in: [CURRENCY_CODE.SATOSHI, CURRENCY_CODE.VNDC] },
    };

    if (
      UtilsService.getInstance().compareVersion(
        version,
        MobileVersion['1.3.5'],
      ) > -1
    ) {
      where.code = undefined;
      where.visible = true;
    }
    return this._repo
      .getCurrency()
      .findMany({ where, select: { code: true, name: true } });
  }
}
