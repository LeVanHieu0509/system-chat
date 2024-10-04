import { MESSAGE_PATTERN, QUEUES } from '@app/common/constants';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { OTPRequestDto, OTPTypeRequestDto } from 'libs/dto/src';

@Injectable()
export class AuthService {
  private readonly _logger = new Logger(AuthService.name);

  // Sử dụng dependency injection để inject đối tượng ClientProxy tương ứng với hàng đợi (queue) xác thực (AUTHENTICATOR) vào controller.
  // Điều này giúp controller có thể gửi tin nhắn qua RabbitMQ đến các microservice khác.

  constructor(
    @Inject(QUEUES.AUTHENTICATOR) private readonly _clientAuth: ClientProxy,
  ) {}

  async sendOtpRequest(body: OTPRequestDto & OTPTypeRequestDto): Promise<any> {
    try {
      return this._clientAuth.send<boolean, OTPRequestDto & OTPTypeRequestDto>(
        MESSAGE_PATTERN.AUTH.REQUEST_OTP,
        body,
      );
    } catch (error) {
      this._logger.error('Error sending OTP request:', error);
      throw new Error('Failed to process OTP request. Please try again later.');
    }
  }
}
