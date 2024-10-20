'use strict';

import { RpcException } from '@nestjs/microservices';

export class LockVersionMismatchException extends RpcException {
  constructor() {
    super({
      name: LockVersionMismatchException.name,
      message: 'LOCK_VERSION_MISMATCH',
    });
  }
}
