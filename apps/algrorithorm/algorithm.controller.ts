import { Body, Controller, Post } from '@nestjs/common';
import { AlgorithmService } from './algorithm.service';

@Controller('algorithm')
export class AlgorithmController {
  constructor(private algorithmService: AlgorithmService) {}

  @Post('linked-list')
  async LinkedListAlgo(@Body() type: 'add-first') {
    return this.algorithmService.addFirst();
  }
}
