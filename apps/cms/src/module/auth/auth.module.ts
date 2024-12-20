import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CMS_JWT_EXPIRATION_TIME, CMS_JWT_SECRET_KEY } from 'libs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RepoModule } from '@app/repositories/repo.module';

@Module({
  imports: [
    RepoModule,
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.registerAsync({
      useFactory: () => {
        return {
          secret: CMS_JWT_SECRET_KEY,
          signOptions: { expiresIn: CMS_JWT_EXPIRATION_TIME },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
