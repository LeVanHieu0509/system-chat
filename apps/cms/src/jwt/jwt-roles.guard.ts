import { RoleType } from '@app/common';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser, RequestUser } from '../dto';

@Injectable()
export class JwtRolesAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Request is using Public decorator
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    if (await super.canActivate(context)) {
      const roles = this.reflector.getAllAndMerge<RoleType[]>('roles', [
        context.getHandler(),
        context.getClass(),
      ]);
      if (roles.length === 0) {
        return true;
      }

      const request: RequestUser = context.switchToHttp().getRequest();
      const user = request.user as AuthUser;
      if (user && roles.includes(user.role)) {
        return true;
      }
    }
    return false;
  }
}
