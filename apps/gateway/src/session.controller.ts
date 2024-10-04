import { Body, Controller, Get, Logger, Post, Session } from '@nestjs/common';

@Controller('session')
export class SessionController {
  private readonly _logger = new Logger(SessionController.name);

  @Post('set-session')
  async setSession(@Body() body, @Session() session: Record<string, any>) {
    this._logger.log(`setSession --> body:`, JSON.stringify(body));

    session.username = body.username;

    return 'Session has been set';
  }

  @Get('get-session')
  async getSession(@Session() session: Record<string, any>) {
    if (session.username) {
      return `Hello, ${session.username}`;
    }

    return 'No session not found';
  }

  @Get('destroy-session')
  async destroySession(@Session() session) {
    session.username = null;

    return 'Session is destroy';
  }
}
