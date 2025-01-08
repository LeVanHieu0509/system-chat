### Khái niệm:

1. CacheInterceptor trong NestJS được sử dụng để thêm tính năng caching (bộ nhớ đệm) cho các yêu cầu HTTP,
2. giúp cải thiện hiệu năng của ứng dụng bằng cách tránh xử lý lại các yêu cầu lặp lại giống nhau trong một khoảng thời gian ngắn
3. Ý Nghĩa của CacheInterceptor:

- Giảm Tải Hệ Thống:

* kết quả của route đó sẽ được lưu vào bộ nhớ đệm (cache) trong một khoảng thời gian nhất định
* Khi có một yêu cầu giống với yêu cầu trước đó, thay vì xử lý lại từ đầu
  (ví dụ: truy vấn cơ sở dữ liệu, gọi đến dịch vụ khác, xử lý logic phức tạp),
  hệ thống sẽ lấy kết quả đã lưu từ cache và trả về cho người dùng, từ đó giảm thiểu tài nguyên và thời gian xử lý

* Tăng Tốc Độ Trả Kết Quả

- Bằng cách lấy kết quả từ cache, tốc độ trả kết quả sẽ nhanh hơn nhiều so với việc thực hiện lại các bước xử lý phức tạp
- Điều này đặc biệt hữu ích cho các yêu cầu tốn nhiều thời gian để xử lý (ví dụ: tính toán phức tạp, gọi đến các dịch vụ từ bên thứ ba)

* Cải thiện hiệu suất các API có thể dự đoán được

- CacheInterceptor được áp dụng với các API có kết quả có thể dự đoán trước trong một khoảng thời gian.
  Ví dụ: API lấy thông tin cấu hình, API trả về kết quả mà không thay đổi quá thường xuyên.

### EXAMPLE

1. @UseInterceptors(CacheInterceptor)

- Khi bạn áp dụng CacheInterceptor cho endpoint GET /refresh-token,
- nghĩa là mỗi khi có yêu cầu GET tới endpoint này, kết quả của yêu cầu sẽ được lưu lại vào bộ nhớ đệm.
- CacheInterceptor giúp giảm tải và tăng tốc độ phản hồi cho API của bạn bằng cách
  lưu kết quả của các yêu cầu lặp lại trong một khoảng thời gian ngắn

Ngoài ra:

Khi nào sử dụng Interceptor?
Khi bạn cần:

1. Xử lý logic trước hoặc sau controller.
2. Ghi log hoặc đo thời gian xử lý.
3. Format lại response cho client.
4. Kiểm tra phiên bản API hoặc thêm metadata vào request/response.

Example:

1. convert request - Check version
2. convert response response phân trang, 404
3. redlock
