import { Controller, Get } from '@nestjs/common';
import { AuthenticatorService } from './authenticator.service';

@Controller()
export class AuthenticatorController {
  //Controllers are responsible for handling incoming requests and returning responses to the client.
  constructor(private readonly appService: AuthenticatorService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
