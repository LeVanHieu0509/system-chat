import {
  MainValidationPipe,
  MESSAGE_PATTERN,
  Public,
  QUEUES,
} from '@app/common';
import { VersionQueryDto } from '@app/dto/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Controller,
  Get,
  Inject,
  Logger,
  Query,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('CashBack')
@ApiResponse({ status: 200, description: 'Created' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden' })
@ApiResponse({ status: 404, description: 'Not Found' })
@Controller('api/cashback')
export class CashbackController {
  private readonly _logger = new Logger(CashbackController.name);

  constructor(
    @Inject(QUEUES.CASHBACK) private readonly _clientCashback: ClientProxy,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Get Coins' })
  @UseInterceptors(CacheInterceptor)
  @UsePipes(new MainValidationPipe())
  @Get('coins')
  async getCoins(@Query() query: VersionQueryDto) {
    return this._clientCashback.send(MESSAGE_PATTERN.CASHBACK.COIN_LIST, query);
  }
}
