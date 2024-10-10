import { MESSAGE_PATTERN } from '@app/common/constants';
import { Ack } from '@app/common/decorators/ack.decorator';
import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import {
  Account,
  FindAccountRequestDto,
  OTPRequestDto,
  SignupRequestDto,
} from 'libs/dto/src';
import { AuthenticatorService } from './authenticator.service';

@Controller()
export class AuthenticatorController {
  constructor(private readonly _service: AuthenticatorService) {}

  @Get()
  getHello(): string {
    return this._service.getHello();
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.REQUEST_OTP)
  async requestOTP(@Payload() body: OTPRequestDto, @Ack() _: RmqContext) {
    return this._service.processOTP(body);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.FIND_ACCOUNT)
  async findAccount(
    @Payload() params: FindAccountRequestDto,
    @Ack() _: RmqContext,
  ) {
    return this._service.getAccount(params);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.SIGN_UP)
  async signup(@Payload() input: Account, @Ack() _: RmqContext) {
    return this._service.saveAccount(input);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.SIGN_IN_WITH_GOOGLE)
  async signInWithGoogle(@Payload() accessToken: string, @Ack() _: RmqContext) {
    return this._service.signInWithGoogle(accessToken);
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.SIGN_UP_VERIFY_PASSCODE)
  async verifyPasscodeSignUp(
    @Payload() body: SignupRequestDto,
    @Ack() _: RmqContext,
  ) {
    return this._service.validateSignUp(body);
  }
}
