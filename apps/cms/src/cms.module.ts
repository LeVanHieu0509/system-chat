import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtStrategy } from './jwt/jwt.strategy';
import { JwtRolesAuthGuard } from './jwt/jwt-roles.guard';
import { AuthModule } from './module/auth/auth.module';
import { UserModule } from './module/user/user.module';

@Module({
  imports: [AuthModule, UserModule],
  providers: [JwtStrategy, { provide: APP_GUARD, useClass: JwtRolesAuthGuard }],
})
export class CmsModule {}