import { PayMeResponse } from '@app/dto/cashback';
import { REDLOCK, REDLOCK_TTL } from '@app/redlock/redlock.contants';
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
  Logger,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { default as Redlock } from 'redlock';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

type RedlockType = {
  key: string;
  error: HttpException;
  uuid?: boolean;
  ipn?: boolean;
  thirdParty?: boolean;
};

@Injectable()
export class LockInterceptor implements NestInterceptor {
  @Inject(REDLOCK) private readonly _redlock: Redlock;
  private readonly _logger = new Logger(LockInterceptor.name);
  constructor(private reflector: Reflector) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const meta = this.reflector.get<RedlockType>(
      'redlock',
      context.getHandler(),
    );
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request & { user: { userId: string } }>();
    // this._logger.log(`Redlock intercept -> body: ${JSON.stringify(req.body)}`);
    console.log(`Redlock intercept -> body`, req.body);
    let lockKey = meta.key;
    if (meta.ipn) {
      const body = req.body as PayMeResponse;
      lockKey += body.data.orderId;
    } else if (meta.thirdParty) {
      const body = req.body as {
        email?: string;
        phone?: string;
        uuid?: string;
      };
      lockKey += body.email || body.phone || body.uuid;
    } else {
      if (meta.uuid && !req.user) throw new UnauthorizedException();
      lockKey += (meta.uuid ? req.user.userId : req.path) ?? '';
    }
    this._logger.log(`Redlock intercept -> key: ${lockKey}`);
    try {
      const lock = await this._redlock.acquire([lockKey], REDLOCK_TTL);
      return next.handle().pipe(
        tap(() => lock.redlock),
        catchError((err) => {
          this._logger.log(`Redlock intercept -> pipe error`);
          console.trace(err);
          if (err.getResponse) {
            this._logger.log(
              `Redlock intercept -> pipe error: ${JSON.stringify(
                err.getResponse(),
              )}`,
            );
          }

          //   lock.unlock();
          return throwError(() => err);
        }),
      );
    } catch (err) {
      this._logger.log(`Redlock intercept -> global error`);
      console.trace(err);
      throw meta.error || err;
    }
  }
}
