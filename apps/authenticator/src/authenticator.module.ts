import { Module } from '@nestjs/common';
import { AuthenticatorController } from './authenticator.controller';
import { AuthenticatorService } from './authenticator.service';

@Module({
  imports: [], //TypeOrmModule.forRoot(configService.getTypeOrmConfig())
  controllers: [AuthenticatorController],
  providers: [AuthenticatorService],
})
export class AuthenticatorModule {}
