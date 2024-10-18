import { createLogger, format, Logform, Logger, transports } from 'winston';

import DailyRotateFile from 'winston-daily-rotate-file';

// Các phương thức của winston để tạo và kết hợp các định dạng cho log.
const { combine, timestamp, label, printf, simple, splat } = format;

// Đường dẫn thư mục để lưu trữ log, ở đây dùng thư mục logs trong thư mục hiện tại của dự án
const mainDir = `${process.cwd()}/logs/`;

// Cấu hình chung cho việc xoay vòng file log (tên file, tối đa bao nhiêu ngày, kích thước tối đa, có nén hay không)
const commonTransport = {
  datePattern: 'YYYYMMDD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
};

type TransformableInfo = {
  level: string;
  message: string;
  label: string;
  timestamp: string;
};

function initTransports(serviceName: string) {
  const mainFormat: Logform.Format = combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Thời gian ghi log.
    label({ label: serviceName }), // Nhãn của dịch vụ, để phân biệt log từ các dịch vụ khác nhau.
    splat(),
    simple(),
    // Dùng để định dạng log entry thành chuỗi và in ra với format JSON.
    printf((info: TransformableInfo) => {
      const { level, message, label } = info;
      const splat = info[0];
      const output = {
        time: info.timestamp,
        level,
        label,
        message,
        data: splat,
      };
      return JSON.stringify(output);
    }),
  );

  const dirname = mainDir + serviceName + '/';

  // Tạo các file log cho từng loại log, bao gồm
  const infoFile = new DailyRotateFile({
    filename: `${serviceName}-%DATE%-info.log`,
    level: 'info',
    dirname,
    ...commonTransport,
  });

  const errorFile = new DailyRotateFile({
    filename: `${serviceName}-%DATE%-error.log`,
    level: 'error',
    dirname,
    ...commonTransport,
  });

  const dbFile = new DailyRotateFile({
    filename: `${serviceName}-%DATE%-db.log`,
    level: 'verbose',
    dirname,
    ...commonTransport,
  });

  return { infoFile, errorFile, dbFile, mainFormat };
}

export class LoggerService {
  private static _instance: LoggerService;

  private readonly _loggerInfo: Logger;
  private readonly _loggerErr: Logger;
  private readonly _loggerDb: Logger;

  constructor(serviceName: string) {
    const { mainFormat, infoFile, errorFile, dbFile } =
      initTransports(serviceName);
    this._loggerInfo = createLogger({
      level: 'info',
      transports: [infoFile, new transports.Console()],
      format: mainFormat,
    });
    this._loggerErr = createLogger({
      level: 'error',
      transports: [errorFile, new transports.Console()],
      format: mainFormat,
    });
    this._loggerDb = createLogger({
      level: 'verbose',
      transports: [dbFile, new transports.Console()],
      format: mainFormat,
    });
  }

  static getInstance(serviceName: string) {
    if (this._instance) return this._instance;
    this._instance = new LoggerService(serviceName);
    Object.freeze(this._instance);
    return this._instance;
  }

  public info(message: string, ...meta: any[]) {
    this._loggerInfo.log('info', message, meta);
  }

  public db(message: string, ...meta: any) {
    this._loggerDb.log('verbose', message, meta);
  }

  public error(message: string, ...meta: any) {
    this._loggerErr.log('error', message, meta);
  }
}
