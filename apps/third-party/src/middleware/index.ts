import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { validateAPIKey } from '../shared';
import { MainRepo } from '@app/repositories/main.repo';

@Injectable()
export class MainMiddleware implements NestMiddleware {
  constructor(private readonly _repo: MainRepo) {}

  use(req: Request, res: Response, next: () => void) {
    const apiKey = req.header('x-api-token');

    validateAPIKey(apiKey, req.path, this._repo)
      .then((uuid: string) => {
        req.query.uuid = uuid;
        next();
      })
      .catch(() => {
        res
          .status(HttpStatus.FORBIDDEN)
          .json({ status: 'failure', message: 'Forbidden' });
      });
  }
}
