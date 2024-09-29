import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticatorService {
  getHello(): string {
    return 'Hello World!';
  }
}
