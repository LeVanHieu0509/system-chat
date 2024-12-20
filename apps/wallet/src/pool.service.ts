import { Dayjs, UtilsService } from '@app/utils';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseService } from './common/base.service';
import { EditPoolValueDto } from './common/dto';
import { MainRepo } from '@app/repositories/main.repo';

@Injectable()
export class PoolService extends BaseService {
  private readonly _utils: UtilsService;

  constructor(private readonly _repo: MainRepo) {
    super(PoolService.name);
    this._utils = UtilsService.getInstance();
  }

  async updatePoolClaimGoldenEgg(eggValue: number) {
    this.logStart('updatePoolClaimGoldenEgg');

    const poolValue = await this._repo.getPoolValue().findFirst({
      select: { id: true, eggValue: true },
    });
    if (!poolValue) return;

    const now = this._utils.toDayJs(Date.now());

    await this._repo.transaction(async (prisma) => {
      // Trừ `eggValue` trong bảng PoolValue
      await this._repo.getPoolValue().update({
        where: { id: poolValue.id },
        data: {
          eggValue: { decrement: eggValue },
        },
      });

      // Lưu lịch sử
      await this._repo.getPoolEggHistory().create({
        data: {
          poolId: poolValue.id,
          in: 0,
          out: eggValue,
          last: new Prisma.Decimal(poolValue.eggValue).minus(eggValue),
          date: now.format('YYYY-MM-DD'),
          time: now.format('HH:mm:ss'),
        },
      });

      // Cập nhật lịch sử tỷ lệ
      await this.createPoolRateHistory(poolValue.id, now);
    });

    this.logEnd('updatePoolClaimGoldenEgg');
  }

  async updatePoolBuyEggEvent(amount: number, currencyId: string) {
    this.logStart('updatePoolBuyEggEvent');

    // Lấy dữ liệu liên quan
    const [poolConfig, poolValue, currency] = await Promise.all([
      this._repo.getPoolConfig().findFirst({ select: { revenue: true } }),
      this._repo
        .getPoolValue()
        .findFirst({ select: { id: true, bbcValue: true } }),
      this._repo.getCurrency().findFirst({ where: { id: currencyId } }),
    ]);

    // Kiểm tra điều kiện
    if (!poolConfig || !poolValue || amount <= 0 || currency?.code !== 'BBC') {
      this.logEnd('updatePoolBuyEggEvent');
      return;
    }

    // Tính toán revenue
    const now = this._utils.toDayJs(Date.now());
    const revenue = amount * (poolConfig.revenue / 100);

    // Transaction với Prisma và PostgreSQL
    await this._repo.transaction(async (prisma) => {
      // Cập nhật bbcValue trong bảng poolValue
      await prisma.poolValue.update({
        where: { id: poolValue.id },
        data: {
          bbcValue: { increment: revenue },
        },
      });

      // Tạo lịch sử PoolBBC
      await prisma.poolBBCHistory.create({
        data: {
          poolId: poolValue.id,
          in: revenue,
          out: 0,
          last: new Prisma.Decimal(poolValue.bbcValue).add(revenue).toFixed(2),
          date: now.format('YYYY-MM-DD'),
          time: now.format('HH:mm:ss'),
        },
      });

      // Cập nhật lịch sử tỷ lệ (BBC/Egg)
      const updatedPoolValue = await this._repo.getPoolValue().findUnique({
        where: { id: poolValue.id },
        select: { bbcValue: true, eggValue: true },
      });

      if (updatedPoolValue?.eggValue && +updatedPoolValue.eggValue > 0) {
        const rate = new Prisma.Decimal(updatedPoolValue.bbcValue)
          .dividedBy(updatedPoolValue.eggValue)
          .toFixed(5);

        await prisma.poolRateHistory.create({
          data: {
            poolId: poolValue.id,
            value: +rate,
            date: now.format('YYYY-MM-DD'),
            time: now.format('HH:mm:ss'),
          },
        });
      }
    });

    this.logEnd('updatePoolBuyEggEvent');
  }

  async updatePoolSellGoldenEgg(
    eggValue: number,
    bbcValue: number,
    currencyId: string,
  ) {
    this.logStart('updatePoolSellGoldenEgg');

    // Lấy dữ liệu cần thiết
    const [poolValue, currency] = await Promise.all([
      this._repo.getPoolValue().findFirst({
        select: { id: true, bbcValue: true, eggValue: true },
      }),
      this._repo.getCurrency().findFirst({ where: { id: currencyId } }),
    ]);

    // Kiểm tra điều kiện
    if (!poolValue || currency?.code !== 'BBC') {
      this.logEnd('updatePoolSellGoldenEgg');
      return;
    }

    const now = this._utils.toDayJs(Date.now());

    // Transaction với Prisma
    await this._repo.transaction(async (prisma) => {
      // Tăng `eggValue`
      await this._repo.getPoolValue().update({
        where: { id: poolValue.id },
        data: {
          eggValue: { increment: eggValue },
        },
      });

      // Lưu lịch sử Egg
      await this._repo.getPoolEggHistory().create({
        data: {
          poolId: poolValue.id,
          in: eggValue,
          out: 0,
          last: new Prisma.Decimal(poolValue.eggValue).add(eggValue),
          date: now.format('YYYY-MM-DD'),
          time: now.format('HH:mm:ss'),
        },
      });

      // Giảm `bbcValue`
      await this._repo.getPoolValue().update({
        where: { id: poolValue.id },
        data: {
          bbcValue: { decrement: bbcValue },
        },
      });

      // Lưu lịch sử BBC
      await this._repo.getPoolBBCHistory().create({
        data: {
          poolId: poolValue.id,
          in: 0,
          out: bbcValue,
          last: new Prisma.Decimal(poolValue.bbcValue).minus(bbcValue),
          date: now.format('YYYY-MM-DD'),
          time: now.format('HH:mm:ss'),
        },
      });

      // Cập nhật lịch sử tỷ lệ
      const updatedPoolValue = await prisma.poolValue.findUnique({
        where: { id: poolValue.id },
        select: { bbcValue: true, eggValue: true },
      });

      if (updatedPoolValue?.eggValue && +updatedPoolValue.eggValue > 0) {
        const rate = new Prisma.Decimal(updatedPoolValue.bbcValue)
          .dividedBy(updatedPoolValue.eggValue)
          .toFixed(5);

        await prisma.poolRateHistory.create({
          data: {
            poolId: poolValue.id,
            value: +rate,
            date: now.format('YYYY-MM-DD'),
            time: now.format('HH:mm:ss'),
          },
        });
      }
    });

    this.logEnd('updatePoolSellGoldenEgg');
  }

  async depositPoolValue(input: EditPoolValueDto) {
    const { bbcValue, eggValue, poolId, updatedId } = input;
    this.logStart('depositPoolValue');

    // Lấy giá trị hiện tại của PoolValue
    const poolValue = await this._repo.getPoolValue().findUnique({
      where: { id: poolId },
      select: { id: true, bbcValue: true, eggValue: true },
    });

    // Kiểm tra điều kiện
    if (!poolValue) {
      this.logEnd('depositPoolValue');
      return {};
    }

    const now = this._utils.toDayJs(Date.now());

    // Transaction với Prisma
    await this._repo.transaction(async (prisma) => {
      // Cập nhật giá trị BBC và Egg
      await this._repo.getPoolValue().update({
        where: { id: poolId },
        data: {
          bbcValue: { increment: bbcValue },
          eggValue: { increment: eggValue },
          updatedId: updatedId,
        },
      });

      // Lưu lịch sử BBC nếu `bbcValue` > 0
      if (bbcValue > 0) {
        await this._repo.getPoolBBCHistory().create({
          data: {
            poolId,
            in: bbcValue,
            out: 0,
            last: new Prisma.Decimal(poolValue.bbcValue)
              .add(bbcValue)
              .toFixed(2),
            date: now.format('YYYY-MM-DD'),
            time: now.format('HH:mm:ss'),
          },
        });
      }

      // Lưu lịch sử Egg nếu `eggValue` > 0
      if (eggValue > 0) {
        await this._repo.getPoolEggHistory().create({
          data: {
            poolId,
            in: eggValue,
            out: 0,
            last: new Prisma.Decimal(poolValue.eggValue)
              .add(eggValue)
              .toFixed(2),
            date: now.format('YYYY-MM-DD'),
            time: now.format('HH:mm:ss'),
          },
        });
      }

      // Tính và lưu lịch sử tỷ lệ BBC/Egg
      const updatedPoolValue = await this._repo.getPoolValue().findUnique({
        where: { id: poolId },
        select: { bbcValue: true, eggValue: true },
      });

      if (updatedPoolValue?.eggValue && +updatedPoolValue.eggValue > 0) {
        const rate = new Prisma.Decimal(updatedPoolValue.bbcValue)
          .dividedBy(updatedPoolValue.eggValue)
          .toFixed(5);

        await this._repo.getPoolRateHistory().create({
          data: {
            poolId,
            value: +rate,
            date: now.format('YYYY-MM-DD'),
            time: now.format('HH:mm:ss'),
          },
        });
      }
    });

    this.logEnd('depositPoolValue');
    return { updatedAt: now.toISOString() };
  }

  async withdrawalPoolValue(input: EditPoolValueDto) {
    const { bbcValue, eggValue, poolId, updatedId } = input;
    this.logStart('withdrawalPoolValue');

    // Lấy giá trị hiện tại của PoolValue
    const poolValue = await this._repo.getPoolValue().findUnique({
      where: { id: poolId },
      select: { id: true, bbcValue: true, eggValue: true },
    });

    // Kiểm tra điều kiện
    if (!poolValue) {
      this.logEnd('withdrawalPoolValue');
      return {};
    }

    const now = this._utils.toDayJs(Date.now());

    // Transaction với Prisma
    await this._repo.transaction(async (prisma) => {
      // Cập nhật giá trị BBC và Egg
      await this._repo.getPoolValue().update({
        where: { id: poolId },
        data: {
          bbcValue: { decrement: bbcValue },
          eggValue: { decrement: eggValue },
          updatedId: updatedId,
        },
      });

      // Lưu lịch sử BBC nếu `bbcValue` > 0
      if (bbcValue > 0) {
        await this._repo.getPoolBBCHistory().create({
          data: {
            poolId,
            in: 0,
            out: bbcValue,
            last: new Prisma.Decimal(poolValue.bbcValue)
              .minus(bbcValue)
              .toFixed(2),
            date: now.format('YYYY-MM-DD'),
            time: now.format('HH:mm:ss'),
          },
        });
      }

      // Lưu lịch sử Egg nếu `eggValue` > 0
      if (eggValue > 0) {
        await this._repo.getPoolEggHistory().create({
          data: {
            poolId,
            in: 0,
            out: eggValue,
            last: new Prisma.Decimal(poolValue.eggValue)
              .minus(eggValue)
              .toFixed(2),
            date: now.format('YYYY-MM-DD'),
            time: now.format('HH:mm:ss'),
          },
        });
      }

      // Tính và lưu lịch sử tỷ lệ BBC/Egg
      const updatedPoolValue = await this._repo.getPoolValue().findUnique({
        where: { id: poolId },
        select: { bbcValue: true, eggValue: true },
      });

      if (updatedPoolValue?.eggValue && +updatedPoolValue.eggValue > 0) {
        const rate = new Prisma.Decimal(updatedPoolValue.bbcValue)
          .dividedBy(updatedPoolValue.eggValue)
          .toFixed(5);

        await this._repo.getPoolRateHistory().create({
          data: {
            poolId,
            value: +rate,
            date: now.format('YYYY-MM-DD'),
            time: now.format('HH:mm:ss'),
          },
        });
      }
    });

    this.logEnd('withdrawalPoolValue');
    return { updatedAt: now.toISOString() };
  }

  private async updatePoolValue(
    poolId: string,
    bbcValue: number,
    eggValue: number,
    updatedId?: string,
    increment = false,
  ) {
    // Kiểm tra nếu cần tăng hoặc giảm giá trị
    const bbcUpdate = increment
      ? { increment: bbcValue }
      : { decrement: bbcValue };
    const eggUpdate = increment
      ? { increment: eggValue }
      : { decrement: eggValue };

    // Thực hiện cập nhật giá trị trong bảng poolValue
    return await this._repo.getPoolValue().update({
      where: { id: poolId },
      data: {
        bbcValue: bbcUpdate,
        eggValue: eggUpdate,
        updatedId, // Cập nhật ID người thao tác
      },
    });
  }

  private async createPoolEggHistory(
    poolId: string,
    eggValue: number,
    lastValue: number,
    now: Dayjs,
    increment = false,
  ) {
    // Tính toán giá trị cuối cùng (last)
    const last = increment
      ? new Prisma.Decimal(lastValue).add(eggValue).toNumber()
      : new Prisma.Decimal(lastValue).minus(eggValue).toNumber();

    // Tạo bản ghi lịch sử Egg
    return await this._repo.getPoolEggHistory().create({
      data: {
        poolId, // ID của Pool
        in: increment ? eggValue : 0, // Giá trị vào
        out: !increment ? eggValue : 0, // Giá trị ra
        last, // Giá trị cuối cùng
        date: now.format('YYYY-MM-DD'), // Ngày ghi nhận
        time: now.format('HH:mm:ss'), // Giờ ghi nhận
      },
    });
  }

  private async createPoolBBCHistory(
    poolId: string,
    bbcValue: number,
    lastValue: number,
    now: Dayjs,
    increment = false,
  ) {
    // Tính toán giá trị cuối cùng (last)
    const last = increment
      ? new Prisma.Decimal(lastValue).add(bbcValue).toNumber()
      : new Prisma.Decimal(lastValue).minus(bbcValue).toNumber();

    // Tạo bản ghi lịch sử BBC
    return await this._repo.getPoolBBCHistory().create({
      data: {
        poolId, // ID của Pool
        in: increment ? bbcValue : 0, // Giá trị vào
        out: !increment ? bbcValue : 0, // Giá trị ra
        last, // Giá trị cuối cùng
        date: now.format('YYYY-MM-DD'), // Ngày ghi nhận
        time: now.format('HH:mm:ss'), // Giờ ghi nhận
      },
    });
  }

  private async createPoolRateHistory(poolId: string, now: Dayjs) {
    // Lấy giá trị bbcValue và eggValue của PoolValue
    const poolValue = await this._repo.getPoolValue().findUnique({
      where: { id: poolId },
      select: { bbcValue: true, eggValue: true },
    });

    // Kiểm tra nếu poolValue hợp lệ và eggValue > 0
    if (!poolValue || +poolValue.eggValue === 0) {
      throw new Error(
        `Invalid poolValue or eggValue is zero for poolId: ${poolId}`,
      );
    }

    // Tính toán tỷ lệ giá trị (bbcValue / eggValue)
    const rate = new Prisma.Decimal(poolValue.bbcValue)
      .dividedBy(poolValue.eggValue)
      .toFixed(5);

    // Lưu lịch sử tỷ lệ
    return await this._repo.getPoolRateHistory().create({
      data: {
        poolId, // ID của Pool
        value: +rate, // Tỷ lệ
        date: now.format('YYYY-MM-DD'), // Ngày
        time: now.format('HH:mm:ss'), // Giờ
      },
    });
  }
}
