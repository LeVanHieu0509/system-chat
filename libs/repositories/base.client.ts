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

export class BaseClient {
  protected readonly _logger = new Logger(BaseClient.name);
  protected readonly _client: PrismaClient;
  protected _logClient: MongoClient | null = null; // Khởi tạo _logClient là null
  protected _service: string;

  constructor() {
    this._client = new PrismaClient({
      log: [{ emit: 'event', level: 'query' }],
    });

    (async () => {
      if (DATABASE_LOG) {
        const logClient = new MongoClient(DATABASE_LOG, { tlsInsecure: true });
        try {
          await logClient.connect();
          this._logClient = logClient;
          this._logger.verbose('Connected to MongoDB successfully...');
        } catch (err) {
          this._logger.error('Failed to connect to MongoDB', err);
        }
      }
    })();

    // Đăng ký sự kiện để log các câu lệnh SQL
    this._client.$use(async (params, next) => {
      const start = Date.now();
      const result = await next(params);
      const duration = Date.now() - start;

      this.logQuery(params.model, params.action, duration);
      return result;
    });

    this.executeMigration();
  }

  // Phương thức xử lý transaction
  public transaction(arg: Prisma.PrismaPromise<any>[]) {
    return this._client.$transaction(arg);
  }

  // Phương thức thực hiện migration
  private async executeMigration() {
    if (NODE_ENV !== 'local') {
      await new Promise((resolve, reject) => {
        const { exec } = require('child_process');
        const migrate = exec(
          'yarn prisma migrate deploy',
          { env: process.env },
          (err) => (err ? reject(err) : resolve(true)),
        );
        // Chuyển tiếp stdout và stderr đến process này
        migrate.stdout.pipe(process.stdout);
        migrate.stderr.pipe(process.stderr);
      });
    }
  }

  // Phương thức log các câu lệnh SQL
  private async logQuery(sql: string, params: string, duration?: number) {
    if (sql && this._logClient && /INSERT INTO|UPDATE|DELETE FROM/.test(sql)) {
      const table = getTableFromSQL(sql);
      const collection =
        this._service === 'CMS' ? 'sql_log_cms' : 'sql_log' + table;

      const current = new Date();
      const date = current.toLocaleDateString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
      });
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
