#!/bin/bash
set -e # Tùy chọn này cho biết script sẽ dừng ngay lập tức nếu có bất kỳ lệnh nào trả về mã lỗi khác không phải là 0
set -x # Tùy chọn này sẽ hiển thị tất cả các lệnh mà script đang thực hiện vào terminal

# Đây là một câu lệnh if để kiểm tra biến môi trường RUN_MIGRATIONS. 
# Nếu biến này được đặt (có giá trị), thì khối lệnh bên trong sẽ được thực hiện.
if [ "$RUN_MIGRATIONS" ]; then
  echo "RUNNING MIGRATIONS";
  npm run typeorm:migration:run
fi
echo "START SERVER";
npm run start:prod

# Thường được sử dụng trong môi trường triển khai sản phẩm (production environment) 
# hoặc trên server, nơi bạn cần đảm bảo cơ sở dữ liệu và ứng dụng được đồng bộ trước khi khởi chạy.