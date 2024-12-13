import {
  ClientProxyFactory,
  KafkaOptions,
  Transport,
} from '@nestjs/microservices';
import { Partitioners } from '@nestjs/microservices/external/kafka.interface';

let producerOption = {
  client: {
    clientId: 'order-producer', // Tên riêng cho Producer
    brokers: ['localhost:9092'],
    connectionTimeout: 1000,
    retry: {
      retries: 5, // Số lần thử lại nếu kết nối thất bại
    },
  },
};

let consumerOption = {
  client: {
    clientId: 'order-consumer', // Tên riêng cho Consumer
    brokers: ['localhost:9092'],
    connectionTimeout: 1000,
    retry: {
      retries: 5, // Số lần thử lại nếu kết nối thất bại
    },
  },
  consumer: {
    allowAutoTopicCreation: true,
    groupId: 'nestjs-group-client', // GroupId dành riêng cho Consumer
  },
};

export const orderKafkaOptionsProducer: KafkaOptions = {
  transport: Transport.KAFKA,
  options: producerOption,
};

export const orderKafkaOptionsConsumer: KafkaOptions = {
  transport: Transport.KAFKA,
  options: consumerOption,
};

const orderKafkaProvider = {
  provide: 'KAFKA_SERVICE',
  useFactory: () => {
    return ClientProxyFactory.create(orderKafkaOptionsProducer); // Producer để gửi tin nhắn.
  },
};

export default orderKafkaProvider;
