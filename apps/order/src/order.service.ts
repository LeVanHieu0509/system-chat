import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class OrderService {
  constructor(
    @Inject('ORDER_SERVICE') private readonly billingClient: ClientKafka,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  createOrder({ userId, price }: any) {
    this.billingClient.emit('order_created', '!23');
  }
}
