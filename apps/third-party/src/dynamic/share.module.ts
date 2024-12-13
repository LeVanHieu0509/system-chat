import { RedlockModule } from '@app/redlock';
import { CacheModule } from '@nestjs/cache-manager';
import { DynamicModule, Module } from '@nestjs/common';
import redisStore from 'cache-manager-ioredis';
import {
  CACHE_MAX,
  CACHE_TTL,
  REDIS_HOST,
  REDIS_PASS,
  REDIS_PORT,
} from 'libs/config';

@Module({})
export class SharedModule {
  static forRoot(): DynamicModule {
    return CacheModule.register({
      useFactory: () => ({
        store: redisStore,
        host: REDIS_HOST,
        port: REDIS_PORT,
        auth_pass: REDIS_PASS,
        ttl: CACHE_TTL,
        max: CACHE_MAX,
      }),
    });
  }
}

@Module({})
export class LockModule {
  static forRoot(): DynamicModule {
    return RedlockModule.register();
  }
}
