import { Controller, Get, Inject, OnModuleInit } from '@nestjs/common';
import {
  ClientKafka,
  EventPattern,
  MessagePattern,
} from '@nestjs/microservices';
import { OrderService } from './order.service';

@Controller()
export class OrderController implements OnModuleInit {
  constructor(
    private readonly orderService: OrderService,
    @Inject('KAFKA_SERVICE') private readonly authClient: ClientKafka,
  ) {}

  @Get()
  getHello(): string {
    return this.orderService.getHello();
  }

  @MessagePattern('order_created_123.reply')
  handleOrderCreated(data: any) {
    return 'order_created_123.reply';
  }

  onModuleInit() {
    this.authClient.subscribeToResponseOf('get_user');
  }
}
