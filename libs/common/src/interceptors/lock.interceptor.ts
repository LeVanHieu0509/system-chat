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

// Định nghĩa kiểu dữ liệu cho metadata liên quan đến Redlock
// Bao gồm thông tin về khóa, lỗi trả về, và các tùy chọn liên quan

type RedlockType = {
  key: string; // id định danh tài nguyên cần khóa
  error: HttpException; // Lỗi sẽ được trả về nếu không giữ được khóa
  uuid?: boolean; // Xác định có sử dụng userId để tạo khóa hay không
  ipn?: boolean; // Dựa vào orderId từ IPN để tạo khóa
  thirdParty?: boolean; // Dựa vào email, phone hoặc uuid để tạo khóa
};

@Injectable()
export class LockInterceptor implements NestInterceptor {
  // // Inject Redlock để quản lý khóa phân tán
  @Inject(REDLOCK) private readonly _redlock: Redlock;
  private readonly _logger = new Logger(LockInterceptor.name);

  // Reflector dùng để lấy metadata gắn trên handler
  constructor(private reflector: Reflector) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    // Lấy metadata (key, error, v.v.) từ handler thông qua Reflector
    const meta = this.reflector.get<RedlockType>(
      'redlock',
      context.getHandler(),
    );

    // Truy cập request từ context
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request & { user: { userId: string } }>();

    // Log thông tin request để kiểm tra
    // this._logger.log(`Redlock intercept -> body: ${JSON.stringify(req.body)}`);
    console.log(`Redlock intercept -> body`, req.body);

    // Bắt đầu tạo khóa với key từ metadata
    let lockKey = meta.key;

    // Tùy chỉnh khóa dựa trên các thuộc tính metadata
    if (meta.ipn) {
      // // Nếu là IPN, thêm orderId từ body vào khóa
      const body = req.body as PayMeResponse;
      lockKey += body.data.orderId;
    } else if (meta.thirdParty) {
      // Nếu là giao dịch bên thứ ba, sử dụng email, phone, hoặc uuid để tạo khóa
      const body = req.body as {
        email?: string;
        phone?: string;
        uuid?: string;
      };
      lockKey += body.email || body.phone || body.uuid;
    } else {
      // Nếu có uuid và user không tồn tại, trả về lỗi Unauthorized
      if (meta.uuid && !req.user) throw new UnauthorizedException();

      // Nếu không, sử dụng userId hoặc req.path để tạo khóa
      lockKey += (meta.uuid ? req.user.userId : req.path) ?? '';
    }

    // Log khóa đã tạo để debug
    this._logger.log(`Redlock intercept -> key: ${lockKey}`);
    try {
      // Thử giữ khóa bằng Redlock với TTL được chỉ định
      // Nếu logic trong return this._clientAuth.send mất quá nhiều thời gian và vượt quá giá trị REDLOCK_TTL, khóa sẽ tự động hết hạn (expire).
      const lock = await this._redlock.acquire([lockKey], REDLOCK_TTL);

      // Tiếp tục xử lý handler nếu giữ khóa thành công
      return next.handle().pipe(
        tap(() => lock.redlock), // Xử lý thành công
        catchError((err) => {
          // Xử lý lỗi trong pipeline
          this._logger.log(`Redlock intercept -> pipe error`);
          console.trace(err);
          if (err.getResponse) {
            this._logger.log(
              `Redlock intercept -> pipe error: ${JSON.stringify(
                err.getResponse(),
              )}`,
            );
          }

          // Luôn gọi lock.unlock() bất kể giao dịch thành công hay thất bại để tránh tình trạng "khóa chết".
          // lock.unlock();

          return throwError(() => err);
        }),
      );
    } catch (err) {
      // // Xử lý lỗi nếu không giữ được khóa ban đầu
      this._logger.log(`Redlock intercept -> global error`);
      console.trace(err);

      // Ném lỗi từ metadata hoặc lỗi ban đầu
      throw meta.error || err;
    }
  }
}
