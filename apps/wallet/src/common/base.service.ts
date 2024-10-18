import { LoggerService } from 'libs/plugins/logger.service';
import { UtilsService } from 'libs/utils/src';

export class BaseService {
  protected readonly _logger: LoggerService;

  constructor(serviceName: string) {
    this._logger = new LoggerService(serviceName);
  }

  protected logStart(method: string) {
    this._logger.info(
      `${method} started at ${UtilsService.getInstance()
        .toDayJs(new Date())
        .format('DD/MM/YYYY hh:mm:ss')}`,
    );
  }

  protected logEnd(method: string) {
    this._logger.info(
      `${method} finished at ${UtilsService.getInstance()
        .toDayJs(new Date())
        .format('DD/MM/YYYY hh:mm:ss')}`,
    );
  }
}
