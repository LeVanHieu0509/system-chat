import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Auth } from 'libs/dto/src';

export const AuthUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as Auth;
  },
);
