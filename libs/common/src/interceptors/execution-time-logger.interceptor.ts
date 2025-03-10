import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
/*
    - Log thời gian thực thi của handler (method trong controller hoặc resolver).
    - Bắt lỗi và trả về phản hồi lỗi (error response) khi có exception xảy ra
    - Đo thời gian thực thi logic là một bước cần thiết để theo dõi hiệu năng
  */
export class ExecutionTimeLoggerInterceptor implements NestInterceptor {
  private _logger = new Logger(ExecutionTimeLoggerInterceptor.name);

  // context: chứa thông tin chi tiết về request hiện tại (ai gọi, metadata...).
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();

    // next.handle() đại diện cho pipeline tiếp theo (bên trong handler controller).
    // Bắt đầu xử lý pipeline khi controller/service đã thực hiện logic xong.
    return next.handle().pipe(
      // Khi thành công (next.handle() trả về Observable thành công), ta log thời gian thực thi của handler.
      tap(() => {
        this._logger.log(
          // now lấy thời gian hiện tại trước khi handler chạy, để đo execution time
          //  lấy tên method đang được interceptor chạy
          `[${context.getHandler().name}] Execution time: ${
            Date.now() - now
          }ms`,
        );
      }),
      catchError((err) => {
        this._logger.error(
          `[${context.getHandler().name}] Exception: ${JSON.stringify(err)}`,
        );

        return of(err.getResponse());
      }),
    );
  }
}
