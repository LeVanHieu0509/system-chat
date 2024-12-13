import { MainValidationPipe, Public } from '@app/common';
import { VersionQueryDto } from '@app/dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Controller,
  Get,
  Inject,
  Query,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@Controller('kafka')
export class KafkaController {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  //   onModuleInit() {
  //     // Đăng ký topic phản hồi
  //     this.kafkaClient.subscribeToResponseOf('order.created');
  //   }

  @Public()
  @ApiOperation({ summary: 'Get Coins' })
  @UseInterceptors(CacheInterceptor)
  @UsePipes(new MainValidationPipe())
  @Get('coins')
  async getCoins(@Query() query: VersionQueryDto) {
    const res = firstValueFrom(
      this.kafkaClient.send('order_created_123', query),
    );

    console.log({ query });

    return res;
  }
}
