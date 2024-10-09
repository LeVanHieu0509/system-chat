### Khái niệm

1. Providers là những thành phần cốt lõi giúp quản lý logic của ứng dụng, gọi API, truy vấn dữ liệu, xử lý logic nghiệp vụ.

- AuthService: Là 1 dịch vụ xử lý nghiệp vụ
- authenticatorQueueProvider: xử lý các tác vụ liên quan đến xác thực không đồng bộ thông qua hàng đợi

--> AppModule cung cấp hai providers này cho các thành phần khác trong module, chẳng hạn như controllers, để sử dụng chúng.
--> Các providers (AuthService, authenticatorQueueProvider) được đăng ký trong AppModule để sử dụng cho các controller (AuthController, SessionController).
--> Việc tách biệt providers giúp chia nhỏ logic nghiệp vụ và tái sử dụng code một cách hiệu quả, đồng thời đảm bảo rằng các phần khác nhau của ứng dụng chỉ làm đúng nhiệm vụ của mình.

2. Một class sử dụng @Injectable() là để đánh dấu là lớp này được inject vào controller hoặc service, guard, hay interceptor
3. Khi bạn sử dụng @Injectable(), NestJS sẽ biết rằng lớp này có thể được inject vào các thành phần khác
4. Ví dụ: Thay vì tạo một thể hiện (instance) của AuthService trong AuthController, NestJS sẽ tự động khởi tạo và cung cấp thể hiện này khi cần, giúp code trở nên gọn gàng và dễ bảo trì.

Kết luận: @Injectable() giúp tối ưu hóa quản lý sự phụ thuộc, giảm thiểu việc trùng lặp mã và tăng tính linh hoạt khi phát triển ứng dụng.
Bằng cách sử dụng @Injectable(), bạn sẽ có một cấu trúc ứng dụng gọn gàng, dễ bảo trì và có khả năng mở rộng tốt.
