import { Injectable, NestMiddleware } from '@nestjs/common';
import session from 'express-session';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private readonly sessionMiddleware;

  constructor() {
    // Khởi tạo express-session một lần trong constructor
    this.sessionMiddleware = session({
      secret: 'mysecret', // Chuỗi bí mật để mã hóa session
      resave: false, // Không lưu lại session nếu không có thay đổi
      saveUninitialized: false, // Không tạo session mới nếu chưa có dữ liệu
      cookie: { maxAge: 3600000 }, // Cookie tồn tại trong 1 giờ
    });
  }

  // Nếu không sử dụng use này thì mỗi request sẽ tạo ra 1 instance session, nếu sử dụng thì middleware này chỉ khởi tạo 1 lần và áp dụng
  // trên toàn bộ request thay vì khởi tạo lại cho mỗi request.

  use(req: Request, res: Response, next: NextFunction) {
    // Sử dụng session middleware đã được khởi tạo
    this.sessionMiddleware(req, res, next);
  }
}

/*
  1. Khi người dùng gửi request -> server tạo ra session ID cho người dùng đó -> lưu trên trình duyệt của user
  2. Mỗi request tiếp theo từ người dùng sẽ gửi session ID qua cookie đến server, 
  server sẽ dựa trên session ID này để lấy lại session data của người dùng.
  3. Khi Người dùng A và Người dùng B thực hiện yêu cầu đồng thời, server sử dụng session ID trong cookie của mỗi người để phân biệt dữ liệu session.
  4. Nên sử dụng quản lý Session trên Redis: Một lựa chọn phổ biến do hiệu suất cao và khả năng mở rộng tốt
*/
