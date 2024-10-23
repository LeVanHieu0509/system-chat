import { Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { DATABASE_LOG, NODE_ENV } from 'libs/config';
import { snakeCase } from 'lodash';
import { MongoClient } from 'mongodb';

const INSERT_KEYWORD = 'INSERT INTO';
const UPDATE_KEYWORD = 'UPDATE';
const DELETE_KEYWORD = 'DELETE FROM';

// Hàm lấy tên bảng từ câu lệnh SQL

function getTableFromSQL(sql: string): string {
  let table = '';

  // Regular expression to match table names
  const matchTableName = (keyword: string, sql: string) => {
    const regex = new RegExp(`${keyword}\\s+(\\w+)`, 'i');
    const match = sql.match(regex);
    return match ? match[1] : '';
  };

  // Sử dụng tên model từ PrismaClient
  if (sql.startsWith('WITH "upsertCashbackAvailable"')) {
    table = snakeCase('CashbackTransaction'); // Không cần Prisma.ModelName
  } else if (sql.startsWith('WITH "upsert"')) {
    table = snakeCase('CashbackTransactionBroker'); // Không cần Prisma.ModelName
  } else if (sql.startsWith(INSERT_KEYWORD)) {
    table = matchTableName(INSERT_KEYWORD, sql);
  } else if (sql.startsWith(UPDATE_KEYWORD)) {
    table = matchTableName(UPDATE_KEYWORD, sql);
  } else if (sql.startsWith(DELETE_KEYWORD)) {
    table = matchTableName(DELETE_KEYWORD, sql);
  }

  // Return formatted table name
  return '_' + table.replace(/"/gm, '').replace('.', '_');
}

// Phương thức này cho phép thực hiện các giao dịch trong Prisma. Nhận vào một mảng các promise và thực hiện chúng như một giao dịch.
export class BaseClient {
  protected readonly _logger = new Logger(BaseClient.name);
  protected readonly _client: PrismaClient; //Khởi tạo client Prisma với cấu hình để ghi log các câu lệnh SQL.
  protected _logClient: MongoClient | null = null; // Khởi tạo _logClient là null
  protected _service: string;

  constructor() {
    this._client = new PrismaClient({
      // Ghi lại log dưới dạng sự kiện.
      // Log ở mức độ query, tức là ghi lại các câu lệnh SQL được thực thi.

      log: [{ emit: 'event', level: 'query' }],
    });

    // MongoDB được sử dụng để lưu trữ các log SQL (INSERT, UPDATE, DELETE), giúp theo dõi hoạt động của cơ sở dữ liệu.
    (async () => {
      if (DATABASE_LOG) {
        // Được khởi tạo với cấu hình tlsInsecure: true để bỏ qua việc xác thực chứng chỉ TLS.
        const logClient = new MongoClient(DATABASE_LOG, { tlsInsecure: true });

        try {
          // Nếu kết nối thành công, ghi log với mức verbose
          await logClient.connect();
          this._logClient = logClient;
          this._logger.verbose('Connected to MongoDB successfully...');
        } catch (err) {
          this._logger.error('Failed to connect to MongoDB', err);
        }
      }
    })();

    // Đăng ký sự kiện để log các câu lệnh SQL
    // Sử dụng middleware để ghi lại thời gian thực hiện của mỗi câu lệnh SQL và gọi logQuery để ghi log chi tiết.
    this._client.$use(async (params, next) => {
      // Khi một câu lệnh SQL được thực thi, lưu lại thời điểm bắt đầu (start = Date.now()).
      const start = Date.now();
      const result = await next(params);

      // Sau khi câu lệnh được thực thi, tính toán thời gian hoàn thành bằng cách lấy hiệu giữa thời gian kết thúc và thời gian bắt đầu
      const duration = Date.now() - start;

      this.logQuery(params.model, params.action, duration);
      return result;
    });

    this.executeMigration();
  }

  // Phương thức xử lý transaction
  public transaction(
    arg:
      | Prisma.PrismaPromise<any>[]
      | ((prisma: Prisma.TransactionClient) => Promise<any>),
  ) {
    if (Array.isArray(arg)) {
      return this._client.$transaction(arg);
    } else {
      return this._client.$transaction(arg);
    }
  }

  // Phương thức thực hiện migration
  // Phương thức này thực hiện việc di cư cơ sở dữ liệu (migration) khi không chạy trong môi trường local.
  // Sử dụng child_process để gọi lệnh di cư từ yarn.
  // Hiện tại có bao nhiêu phiên bản migration thì nó sẽ chạy hết các phiên bản đó luôn để cấp nhật dữ liệu phù hợp với CSDl tránh bị lỗi.
  private async executeMigration() {
    this._logger.log(`executeMigration --> NODE_ENV=${NODE_ENV}`);

    if (NODE_ENV !== 'local') {
      await new Promise((resolve, reject) => {
        const { exec } = require('child_process');

        // Lệnh này sử dụng Prisma để áp dụng (deploy) các migrations đã được tạo ra cho cơ sở dữ liệu.
        // Nó sẽ điều chỉnh cơ sở dữ liệu theo các thay đổi trong mô hình dữ liệu(schema).
        const migrate = exec(
          'yarn prisma migrate deploy',
          { env: process.env }, // Các biến môi trường hiện tại (process.env) được truyền vào để lệnh có thể sử dụng chúng khi thực thi.
          (err) => (err ? reject(err) : resolve(true)),
        );
        // Chuyển tiếp stdout và stderr đến process này, giúp hiển thị lỗi trên terminal.
        migrate.stdout.pipe(process.stdout);
        migrate.stderr.pipe(process.stderr);
      });
    }
  }

  // Phương thức log các câu lệnh SQL (chỉ với các lệnh INSERT, UPDATE, DELETE) vào MongoDB.

  private async logQuery(sql: string, params: string, duration?: number) {
    if (sql && this._logClient && /INSERT INTO|UPDATE|DELETE FROM/.test(sql)) {
      const table = getTableFromSQL(sql);
      const collection =
        this._service === 'CMS' ? 'sql_log_cms' : 'sql_log' + table;

      const current = new Date();

      //  Định dạng ngày theo chuẩn Việt Nam và sử dụng múi giờ Asia/Ho_Chi_Minh.
      const date = current.toLocaleDateString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
      });

      // Định dạng thời gian tương tự, lấy ra thời gian cụ thể theo múi giờ.
      const time = current.toLocaleTimeString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
      });

      await this._logClient
        .db()
        .collection(collection)
        .insertOne({
          sql,
          params,
          createdAt: `${date} ${time}`,
        });
    }
  }
}

/*
    Lớp BaseClient này quản lý việc kết nối với cơ sở dữ liệu thông qua Prisma, 
    ghi lại các câu lệnh SQL vào MongoDB và xử lý các giao dịch. 
    Nó cũng đảm bảo rằng các migration được thực hiện đúng cách tùy thuộc vào môi trường của ứng dụng. 
    Các câu lệnh SQL và các chi tiết liên quan đến thời gian thực hiện đều được ghi lại để phục vụ cho việc phân tích và debug sau này.
*/
