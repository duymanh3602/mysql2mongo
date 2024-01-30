# Awesome Project Build with TypeORM

~~Steps to run this project:~~ **deprecated***

1. Run `npm i` command
2. Setup database settings inside `data-source.ts` file
3. Run `npm start` command
-----------------------------------------------------
Update .env

Install dependencies ```yarn```

Run scripted ```yarn start```

-----------------------------------------------------
Estimated results (local)

Specs: 
+ CPU: i5-1135G7
+ Ram: 16Gb 3200Mhz

Gen test MySQL 100000 records : 96.54 (s)

Transform 100000 records from MySQL to MongoDB: ~50 (s)

------------------------------------------------

```.env```

MONGO_CONNECT_STRING= // Connection String của MongoDb

MONGO_COLLECTION_NAME= // Tên bảng muốn Migrate sang

MYSQL_HOST= // Host của Mysql (localhost, ...)

MYSQL_PORT= // Port của Mysql (mặc định 3306)

MYSQL_USER= // tài khoản MySQL

MYSQL_PASSWORD= // Password mysql

MYSQL_DATABASE= // Schema sử dụng

MYSQL_TABLE_NAME= // Bảng Question export

BATCH_SIZE= // số lượng lấy mỗi lần để tối ưu (mặc định 1000 records / req)

## Không dừng đột ngột khi đang chạy => do chưa đồng bộ được update vào mongo và cập nhật IsUpdate vào trong MySQL. 

## Nhận q và chờ các task complete để tắt.
