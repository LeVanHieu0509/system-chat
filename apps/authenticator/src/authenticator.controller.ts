import { MESSAGE_PATTERN } from '@app/common/constants';
import { Ack } from '@app/common/decorators/ack.decorator';
import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { FindAccountRequestDto, OTPRequestDto } from 'libs/dto/src';
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
}
