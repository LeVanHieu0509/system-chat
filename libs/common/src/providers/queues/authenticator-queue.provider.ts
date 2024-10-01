import { QUEUES } from '@app/common/constants';
import {
  ClientProxyFactory,
  RmqOptions,
  Transport,
} from '@nestjs/microservices';
import { RABBITMQ_URLS } from 'libs/config';

let option = {
  // prefetchCount: Đặt số đếm prefetch cho kênh
  // isGlobalPrefetchCount: Cho phép prefetch cho mỗi kênh
  // noAck: Nếu sai, chế độ xác nhận thủ công được bật
  // consumerTag: Mã định danh thẻ người tiêu dùng (đọc thêm tại đây)
  //queueOptions: Các tùy chọn hàng đợi bổ sung (đọc thêm tại đây)
  // socketOptions: Các tùy chọn socket bổ sung
  // headers: Các tiêu đề được gửi cùng với mọi thông báo

  urls: RABBITMQ_URLS,
  queue: QUEUES.AUTHENTICATOR,
  queueOptions: {
    durable: true, // Phải tương thích với cấu hình ban đầu của hàng đợi
  },
};

/*
    Đảm bảo tính nhất quán: Bằng cách yêu cầu xác nhận từ RabbitMQ,
    bạn có thể đảm bảo rằng tin nhắn đã được nhận và lưu trữ trong hàng đợi,
    giúp tránh mất dữ liệu trong trường hợp có sự cố mạng hoặc lỗi.

    Quản lý lỗi: Nếu RabbitMQ không thể lưu trữ tin nhắn (do hàng đợi không tồn tại hoặc lỗi khác),
    bạn có thể xử lý lỗi này trong mã của mình và thực hiện các hành động cần thiết.
*/
export const authenticatorQueueOptionsProducer: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    ...option,
    noAck: false, // Khi bạn đặt noAck: false cho producer, điều này có nghĩa là producer yêu cầu RabbitMQ xác nhận rằng tin nhắn đã được gửi thành công tới hàng đợi.
  },
};

/*
    Tăng hiệu suất: Việc không yêu cầu xác nhận có thể giúp tăng tốc độ xử lý tin nhắn, 
    vì consumer không cần phải chờ RabbitMQ xác nhận mỗi lần nhận tin nhắn.

    Dễ dàng hơn trong các trường hợp không cần xử lý thủ công: Nếu bạn đang xử lý tin nhắn một cách không cần quản lý trạng thái 
    (ví dụ: nếu bạn có thể chấp nhận việc mất tin nhắn hoặc đã có cơ chế khác để đảm bảo tính chính xác), 
    việc đặt noAck thành true có thể phù hợp hơn.
*/
export const authenticatorQueueOptionsConsumer: RmqOptions = {
  transport: Transport.RMQ,
  options: {
    ...option,
    noAck: true, // Khi bạn đặt noAck: true cho consumer, điều này có nghĩa là consumer sẽ không yêu cầu xác nhận (acknowledgment) từ RabbitMQ khi đã nhận tin nhắn.
  },
};

const authenticatorQueueProvider = {
  provide: QUEUES.AUTHENTICATOR,
  useFactory: () => {
    return ClientProxyFactory.create(authenticatorQueueOptionsConsumer);
  },
};

export default authenticatorQueueProvider;
