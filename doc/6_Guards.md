1. Guards trong NestJS là một công cụ quan trọng để quản lý quyền truy cập vào các route của ứng dụng
2. Guards được sử dụng để bảo vệ các route bằng cách kiểm tra những điều kiện cụ thể như quyền truy cập,
   xác thực, hoặc logic khác trước khi các request được chuyển tới controller và xử lý.
3. Guards trả về giá trị true hoặc false để quyết định xem có cho phép request đi tiếp hay không
4. Guards giúp tách biệt logic xác thực khỏi logic xử lý chính của controller, giúp code rõ ràng và dễ bảo trì hơn.
5. Bạn có thể áp dụng cùng một Guard cho nhiều route, giúp tránh phải viết lại cùng một logic xác thực nhiều lần.
6. Guard này giúp bảo vệ các route và xác định chính xác quyền truy cập của người dùng,
   đảm bảo rằng chỉ những người có thông tin xác thực hợp lệ mới có thể truy cập vào API.
