import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

/*
    1. VersionInterceptor được sử dụng để đảm bảo rằng các yêu cầu đến API 
    luôn có thông tin phiên bản (version) trong query hoặc header.
    2. Nếu không có phiên bản trong query string (req.query), interceptor sẽ tự động thêm phiên bản từ header x-api-version
*/
@Injectable()
export class VersionInterceptor implements NestInterceptor {
  // Dùng ExecutionContext để lấy thông tin của HTTP request.
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();

    //Nếu query string của request không chứa version, interceptor sẽ:
    if (!req.query['version']) {
      // Gán giá trị từ header vào query string (req.query.version).
      req.query['version'] = req.headers['x-api-version'];
    }

    // Sau khi gán version, interceptor sử dụng next.handle() để chuyển request đến middleware/controller tiếp theo.
    return next.handle();
  }
}
