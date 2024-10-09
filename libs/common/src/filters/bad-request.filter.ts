import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { Response } from 'express';
import { IBadRequestExceptionResponse } from '../interfaces';

// bắt và tùy chỉnh thông báo lỗi khi có yêu cầu không hợp lệ.
@Catch(BadRequestException) // Được sử dụng để chỉ định rằng bộ lọc này sẽ bắt lỗi loại BadRequestException.
export class BadRequestExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse =
      exception.getResponse() as IBadRequestExceptionResponse;
    const { statusCode, message, error } = exceptionResponse; // Lấy thông tin lỗi mà BadRequestException cung cấp.

    //  Trả về phản hồi JSON tùy chỉnh cho người dùng, với các trường:
    response.status(status).json({
      status: statusCode,
      message: error,
      data: message,
    });
  }
}

/*
    Khi người dùng gửi một yêu cầu không hợp lệ (ví dụ: thiếu thông tin hoặc dữ liệu sai định dạng), 
    thay vì để ứng dụng tự động trả về thông báo lỗi mặc định, bộ lọc này sẽ tùy chỉnh thông báo lỗi để dễ hiểu hơn cho người dùng.
*/
