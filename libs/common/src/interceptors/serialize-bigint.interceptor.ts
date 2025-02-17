import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/*
  SerializeBigIntInterceptor chuyển đổi tất cả các giá trị bigint thành kiểu số (number) hoặc giá trị mặc định 0 
  (nếu không thể chuyển đổi), đảm bảo dữ liệu có thể được tuần tự hóa thành JSON.
*/
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

/*
  @Get()
getBigIntData() {
  return { id: BigInt(1234567890123456789), name: 'example' };
}

--> chuyển đổi dữ liệu từ bigint về number

{
  "id": 1234567890123456789n,
  "name": "example"
}

{
  "id": 1234567890123456789,
  "name": "example"
}

-> Không còn lỗi TypeError: Do not know how to serialize a BigInt khi trả về dữ liệu từ NestJS API.
*/
