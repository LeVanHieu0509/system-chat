import {
  BadRequestException,
  Logger,
  Optional,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

/**
 * MainValidationPipe
 *
 * @author HoaiNT
 */
export class MainValidationPipe extends ValidationPipe {
  private readonly _logger = new Logger(MainValidationPipe.name);

  constructor(@Optional() options: ValidationPipeOptions = {}) {
    super({
      // Các tùy chọn này dùng để loại bỏ các thuộc tính không hợp lệ và tự động chuyển đổi kiểu dữ liệu đầu vào
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
      ...options,
    });
  }

  // Tùy chỉnh cách xử lý lỗi. Khi có lỗi, thay vì trả về thông tin lỗi mặc định,
  // nó sẽ trả về thông tin về trường(field) và thông điệp lỗi(message) dễ hiểu hơn.
  exceptionFactory: any = (errors: ValidationError[]) => {
    const transformedErrors = errors
      .map((error) => this.mapChildren(error))
      .reduce(
        (previousErrors, currentError) => [...previousErrors, ...currentError],
        [],
      )
      .filter((error) => !!Object.keys(error.constraints).length)
      .map((error) => ({
        field: error.property,
        message: Object.values(error.constraints)[0],
      }));

    this._logger.log(
      `MainValidationPipe --> transformedErrors: ${JSON.stringify(
        transformedErrors,
      )}`,
    );
    throw new BadRequestException(transformedErrors);
  };

  // Hai hàm này giúp xử lý và tạo danh sách lỗi chi tiết cho từng trường hợp con trong cây dữ liệu, bao gồm cả nested object
  private mapChildren(error: ValidationError): ValidationError[] {
    if (!(error.children && error.children.length)) {
      return [error];
    }
    const validationErrors = [];
    for (const item of error.children) {
      const hasChildren = item.children && item.children.length;
      const key = hasChildren
        ? `${error.property}[${item.property}]`
        : `${error.property}.${item.property}`;
      if (hasChildren) {
        for (const i of item.children) {
          validationErrors.push({ ...i, property: `${key}${i.property}` });
        }
      }
      validationErrors.push(
        this.prependConstraints({ ...item, property: key }),
      );
    }

    this._logger.log(
      `MainValidationPipe --> validationErrors: ${JSON.stringify(
        validationErrors,
      )}`,
    );
    return validationErrors;
  }

  private prependConstraints(error: ValidationError): ValidationError {
    const constraints = {};
    for (const key in error.constraints) {
      constraints[key] = error.constraints[key];
    }
    return { ...error, constraints };
  }
}

/*
  Pipes trong NestJS được sử dụng để chuyển đổi và xác thực dữ liệu trước khi nó được xử lý bởi các phương thức của controller.
  Pipes giúp đảm bảo dữ liệu từ người dùng là hợp lệ trước khi thực hiện các tác vụ khác như lưu trữ hoặc xử lý.

  Note: 
  1. Pipes kiểm tra dữ liệu có đúng định dạng hoặc đáp ứng các yêu cầu hay không. Ví dụ, kiểm tra xem dữ liệu là số hay có trường nào bị thiếu không.
  2. Pipes có thể chuyển đổi dữ liệu đầu vào thành một định dạng khác mà phương thức của bạn mong muốn. Ví dụ, chuyển đổi một chuỗi sang kiểu số.
*/

/*
  Tại sao nên sử dụng trong route của từng controller
  1. tùy chỉnh logic xử lý dựa trên yêu cầu của từng route cụ thể.
  2. Giảm Thiểu Overhead Không Cần Thiết vì tất cả các route trong ứng dụng của bạn sẽ bị ảnh hưởng bởi cùng một pipe
  3. Mỗi route có thể cần các pipe khác nhau để xử lý hoặc xác thực dữ liệu một cách riêng biệt. 
  4. Dễ dàng bảo trì hoặc thay đổi logic mà không lo ảnh hưởng đến toàn bộ ứng dụng.
  5. Không phải tất cả các endpoint đều cần xác thực hoặc chuyển đổi dữ liệu
*/
