import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SerializeBigIntInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        map((data) =>
          data
            ? JSON.parse(
                JSON.stringify(data, (key, value) =>
                  typeof value === 'bigint' ? +value.toString() || 0 : value,
                ),
              )
            : {},
        ),
      );
  }
}
