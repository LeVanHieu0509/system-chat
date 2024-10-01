import { Controller, Get } from '@nestjs/common';
import { AuthenticatorService } from './authenticator.service';
import { MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { MESSAGE_PATTERN } from '@app/common/constants';
import { OTPRequestDto } from 'libs/dto/src';
import { Ack } from '@app/common/decorators/ack.decorator';

@Controller()
export class AuthenticatorController {
  constructor(private readonly _service: AuthenticatorService) {}

  //Controllers are responsible for handling incoming requests and returning responses to the client.
  // constructor(private readonly appService: AuthenticatorService) {}

  @Get()
  getHello(): string {
    return this._service.getHello();
  }

  @MessagePattern(MESSAGE_PATTERN.AUTH.REQUEST_OTP)
  async requestOTP(@Payload() body: OTPRequestDto, @Ack() _: RmqContext) {
    return this._service.processOTP(body);
  }
}
