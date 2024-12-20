import { CachingService } from '@app/caching';
import { MainValidationPipe, Public } from '@app/common';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CMS_JWT_EXPIRATION_TIME } from 'libs/config';
import { RequestUser } from '../../dto';
import {
  CheckTokenRequestDto,
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
  SigninRequestDto,
  TokenPayloadDto,
  UserProfileRequestDto,
} from './auth.dto';
import { AuthService } from './auth.service';
import { PasswordRequestDto } from '../user/user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly _service: AuthService,
    private readonly _jwtService: JwtService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Post('sign-in')
  async signIn(@Body() body: SigninRequestDto) {
    const user = await this._service.signIn(body.username, body.password);
    if (user) {
      const expiresIn = CMS_JWT_EXPIRATION_TIME;
      const token = this._jwtService.sign(user);
      CachingService.getInstance().set(
        'BITBACK_CMS' + user.id,
        token,
        expiresIn,
      );
      const output = Object.assign(
        new TokenPayloadDto(token, expiresIn, user.role),
        {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
        },
      );
      return output;
    } else {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Post('forgot-password')
  async forgotPassword(@Body() { email }: ForgotPasswordRequestDto) {
    return this._service.processForgot(email);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Post('check-token')
  async checkToken(@Body() { email, token }: CheckTokenRequestDto) {
    return this._service.processCheckToken(email, token);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe())
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordRequestDto) {
    const user = await this._service.processResetPassword(body);
    console.log({ user });

    if (user) {
      const token = this._jwtService.sign(user);
      console.log('token', token);
      CachingService.getInstance().set('BITBACK_CMS' + user.id, token);
      return new TokenPayloadDto(token, CMS_JWT_EXPIRATION_TIME, user.role);
    } else {
      throw new BadRequestException([
        { field: 'token', message: 'Token invalid' },
      ]);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get('profile')
  async getProfile(@Req() { user }: RequestUser) {
    return this._service.getProfile(user['id']);
  }

  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
  @Patch('profile')
  async editProfile(
    @Body() body: UserProfileRequestDto,
    @Req() { user }: RequestUser,
  ) {
    return this._service.editProfile(body, user['id']);
  }

  @HttpCode(HttpStatus.OK)
  @UsePipes(new MainValidationPipe({ skipMissingProperties: true }))
  @Patch('change-password')
  async changePassword(
    @Body() body: PasswordRequestDto,
    @Req() { user }: RequestUser,
  ) {
    return this._service.editProfile(body, user['id']);
  }
}
