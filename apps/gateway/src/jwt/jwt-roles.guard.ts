import { KYC_STATUS, MobileVersion } from '@app/common/constants';
import { ResponseCustom } from '@app/common/interfaces';
import { VALIDATE_MESSAGE } from '@app/common/validate-message';
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { isDefined, isEmpty } from 'class-validator';
import { Request } from 'express';
import { UtilsService } from 'libs/utils/src';

/*
    1. đảm bảo chỉ cho phép những người dùng có token hợp lệ và đáp ứng các điều kiện xác thực khác mới có thể truy cập
*/
@Injectable()
export class JwtRolesAuthGuard extends AuthGuard('jwt') {
  //AuthGuard('jwt'): sẽ sử dụng cơ chế xác thực JWT (JSON Web Token) có sẵn trong NestJS để kiểm tra token của người dùng

  // Sử dụng Reflector để lấy metadata được gắn vào các route. Reflector cho phép kiểm tra các giá trị như decorator mà bạn gắn lên các route.
  constructor(private reflector: Reflector) {
    super();
  }

  // Phương thức này kiểm tra xem yêu cầu (request) có được cho phép tiếp tục hay không.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Request is using Public decorator
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    //  để kiểm tra tính hợp lệ của token JWT
    if (await super.canActivate(context)) {
      const request: ResponseCustom = context.switchToHttp().getRequest();

      // Nếu không có thông tin người dùng
      if (isEmpty(request.user)) {
        return false;
      }

      return true;
    }
    return false;
  }

  // Đây là phương thức tùy chỉnh xử lý khi token đã được giải mã và trả về thông tin người dùng.
  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ) {
    // Nếu có lỗi hoặc không tìm thấy người dùng, guard sẽ ném ra ngoại lệ
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    const request: Request = context.switchToHttp().getRequest();

    // oạn code này kiểm tra phiên bản của API (x-api-version) từ request.
    // Nếu phiên bản khớp với một giá trị quy định (1.4.1), nó tiếp tục xử lý kiểm tra kycStatus.
    if (
      UtilsService.getInstance().compareVersion(
        request.get('x-api-version'),
        MobileVersion['1.4.1'],
      ) !== -1
    ) {
      const kycStatus = this.reflector.getAllAndOverride<KYC_STATUS>(
        'kycStatus',
        [context.getClass(), context.getHandler()],
      );

      // Sử dụng reflector để lấy metadata kycStatus từ route hoặc class,
      // nếu kycStatus yêu cầu không trùng với user['kycStatus'] thì nó ném ra ngoại lệ ForbiddenException.
      if (isDefined(kycStatus) && kycStatus !== user['kycStatus']) {
        throw new ForbiddenException(
          VALIDATE_MESSAGE.ACCOUNT.INVALID_KYC_STATUS,
        );
      }
    }

    return user;
  }
}

/*
    1. Guards trong NestJS là một công cụ quan trọng để quản lý quyền truy cập vào các route của ứng dụng
    2. Guards được sử dụng để bảo vệ các route bằng cách kiểm tra những điều kiện cụ thể như quyền truy cập, 
    xác thực, hoặc logic khác trước khi các request được chuyển tới controller và xử lý.
    3. Guards trả về giá trị true hoặc false để quyết định xem có cho phép request đi tiếp hay không
    4. Guards giúp tách biệt logic xác thực khỏi logic xử lý chính của controller, giúp code rõ ràng và dễ bảo trì hơn.
    5. Bạn có thể áp dụng cùng một Guard cho nhiều route, giúp tránh phải viết lại cùng một logic xác thực nhiều lần.
    6. Guard này giúp bảo vệ các route và xác định chính xác quyền truy cập của người dùng, 
    đảm bảo rằng chỉ những người có thông tin xác thực hợp lệ mới có thể truy cập vào API.
*/
