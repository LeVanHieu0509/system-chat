import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  // Ghi log to file

  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    next();
  }
}
