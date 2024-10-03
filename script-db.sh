#!/bin/bash
set -e

SERVER="my_database_server"; # Tên của container PostgreSQL.
PW="mysecretpassword"; # Mật khẩu cho người dùng "postgres".
DB="my_database"; # Tên cơ sở dữ liệu sẽ được tạo.

echo "echo stop & remove old docker [$SERVER] and starting new fresh instance of [$SERVER]"
# Dừng và xóa container cũ (nếu tồn tại), sau đó khởi động một container PostgreSQL mới
(docker kill $SERVER || :) && \
  (docker rm $SERVER || :) && \
  docker run --name $SERVER -e POSTGRES_PASSWORD=$PW \
  -e PGPASSWORD=$PW \
  -p 5432:5432 \  # Expose cổng 5432 để PostgreSQL có thể truy cập từ bên ngoài.
  -d postgres # Chạy container PostgreSQL dưới nền (detached mode).

# Chờ PostgreSQL khởi động
echo "sleep wait for pg-server [$SERVER] to start";
SLEEP 3; # Tạm dừng 3 giây để đảm bảo PostgreSQL khởi động hoàn tất.

# Tạo cơ sở dữ liệu mới
echo "CREATE DATABASE $DB ENCODING 'UTF-8';" | docker exec -i $SERVER psql -U postgres
# Liệt kê tất cả các cơ sở dữ liệu để kiểm tra
echo "\l" | docker exec -i $SERVER psql -U postgres
