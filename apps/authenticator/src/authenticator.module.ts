import { Module } from '@nestjs/common';
import { AuthenticatorController } from './authenticator.controller';
import { AuthenticatorService } from './authenticator.service';
import { HttpModule } from '@nestjs/axios';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from '@app/common/filters/http-exception.filter';

@Module({
  imports: [HttpModule], //TypeOrmModule.forRoot(configService.getTypeOrmConfig())
  controllers: [AuthenticatorController],
  providers: [
    AuthenticatorService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AuthenticatorModule {}
