import { DynamicModule, Module } from '@nestjs/common';
import IOClient, { RedisOptions } from 'ioredis';
import { REDIS_HOST, REDIS_PASS, REDIS_PORT } from 'libs/config';
import Redlock from 'redlock';
import { REDLOCK, REDLOCK_OPTIONS } from './redlock.contants';
import { RedlockService } from './redlock.service';

const _redisClients = [
  new IOClient({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASS,
  }),
];

@Module({
  providers: [RedlockService],
  exports: [RedlockModule],
})
export class RedlockModule {
  static register(
    clientOptions: RedisOptions[] = [],
    redlockOptions = REDLOCK_OPTIONS,
  ): DynamicModule {
    const redisClients = _redisClients.concat(
      clientOptions.map((option) => new IOClient(option)),
    );

    // Khóa một tài nguyên trong thời gian nhất định để các instance khác không thể truy cập đồng thời.
    // Đảm bảo tính toàn vẹn dữ liệu khi nhiều service cùng truy cập vào một tài nguyên.
    // Hạn chế số lượng yêu cầu đồng thời trên một tài nguyên cụ thể.
    const redlock = new Redlock(redisClients, redlockOptions);
    const providers = [{ provide: REDLOCK, useValue: redlock }];

    return {
      module: RedlockModule,
      providers,
      exports: providers,
    };
  }
}
