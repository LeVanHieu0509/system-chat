import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { isObject } from 'class-validator';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResponse } from '../interfaces';

/*
1. Chuyển đổi định dạng phản hồi (response) từ controller/middleware thành một chuẩn chung
2. Thêm thông tin bổ sung như status, message, data để đảm bảo phản hồi nhất quán.
3. TransformResponseInterceptor giúp chuẩn hóa mọi phản hồi từ controller trong ứng dụng NestJS, đảm bảo cấu trúc nhất quán.
*/

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  // Truy cập ngữ cảnh của yêu cầu, giúp truy xuất các thông tin như HTTP request/response.
  // CallHandler: Xử lý các luồng dữ liệu từ controller.

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // pipe(): Biến đổi luồng dữ liệu.
    return next.handle().pipe(
      // map(): Thực hiện các phép chuyển đổi trên dữ liệu trả về từ controller
      map((resp) => {
        // Interceptor kiểm tra dữ liệu trả về từ controller (resp) và xử lý theo các trường hợp khác nhau.
        const response = context.switchToHttp().getResponse<Response>();

        // controller đã trả về lỗi hoặc cấu trúc đặc biệt
        if (resp.statusCode) {
          response.status(resp.statusCode);
          const output: IResponse = {
            status: resp.statusCode,
            message: resp.error,
            data: resp.message,
          };

          if (typeof resp.message === 'string') {
            output.data = [{ field: 'system', message: resp.message }];
          }

          return output;
        } else {
          // Nếu không có statusCode, gán mặc định là 200 OK:
          const output: IResponse = {
            status: HttpStatus.OK,
            message: 'Success',
            data: resp,
          };
          if (resp.error) {
            response.status(400);
            output.status = 400;
            output.message = 'Bad Request';
            output.data = [{ field: 'system', message: resp.error }];
          } else if (!resp.error && isObject(resp)) {
            const { data, page, totalRecords } = resp as IResponse;
            if ((page || totalRecords !== undefined) && data) {
              output.page = page;
              output.totalRecords = totalRecords;
              output.data = data;
            }
          }
          return output;
        }
      }),
    );
  }
}

/*
1. Controller trả về lỗi:
                return {
                                statusCode: 400,
                                error: 'Invalid data',
                                message: 'Field "email" is required',
                };

                ==>


                {
                                "status": 400,
                                "message": "Invalid data",
                                "data": [
                                                { "field": "system", "message": "Field \"email\" is required" }
                                ]
                }

2. Controller trả về dữ liệu  phân trang:
                return {
                                data: [{ id: 1, name: 'Item 1' }],
                                page: 1,
                                totalRecords: 10,
                };

                ===> 

               {
                                "status": 200,
                                "message": "Success",
                                "data": [{ "id": 1, "name": "Item 1" }],
                                "page": 1,
                                "totalRecords": 10
                }
*/
