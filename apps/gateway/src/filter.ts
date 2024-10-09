import { AppError } from '@app/common/errors';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { IS_PRODUCTION } from 'libs/config';

@Catch() // Trang trí lớp với decorator Catch, cho biết rằng lớp này sẽ xử lý các ngoại lệ

// Lớp này triển khai giao diện ExceptionFilter, cho phép xử lý các ngoại lệ phát sinh trong ứng dụng.
export class GatewayExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // Chuyển đổi ngữ cảnh từ ArgumentsHost sang ngữ cảnh HTTP.
    const ctx = host.switchToHttp();

    // Lấy đối tượng phản hồi từ Express.
    const response = ctx.getResponse<Response>();

    // Lấy mã trạng thái HTTP từ ngoại lệ. Nếu không có mã trạng thái, mặc định là 500 (INTERNAL_SERVER_ERROR).
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Nếu mã trạng thái là 401, trả về một thông điệp tùy chỉnh với thông tin chi tiết về lỗi xác thực.
    if (status === HttpStatus.UNAUTHORIZED) {
      const res = exception.getResponse();
      const output = {
        status: res['statusCode'],
        message: res['message'],
        data: [{ field: 'user', message: VALIDATE_MESSAGE.UNAUTHORIZED }],
      };
      response.status(status).json(output);

      // Nếu mã trạng thái là 400, trả về thông điệp lỗi nếu có.
    } else if (status === HttpStatus.BAD_REQUEST) {
      const output = exception.getResponse ? exception.getResponse() : {};
      response.status(status).json(output);

      // Nếu mã trạng thái là 403, trả về thông điệp lỗi nếu có.
    } else if (status === HttpStatus.FORBIDDEN) {
      const output = exception.getResponse ? exception.getResponse() : {};
      response.status(status).json(output);
    } else {
      // Nếu mã trạng thái là một mã lỗi 5xx, in ra stack trace của ngoại lệ (nếu trong môi trường phát triển).
      status.toString().startsWith('5') &&
        console.error('exception ->', exception.stack);

      //Nếu đang chạy trong môi trường sản xuất, trả về thông điệp lỗi chung. Ngược lại, trả về thông điệp lỗi chi tiết từ ngoại lệ.
      const message = IS_PRODUCTION
        ? VALIDATE_MESSAGE.SOMETHING_WENT_WRONG
        : exception.message;

      response
        .status(status)
        .json(new AppError(exception.name, message, status));
    }
  }
}
