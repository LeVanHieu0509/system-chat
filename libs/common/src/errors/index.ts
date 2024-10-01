export class AppError {
    statusCode: number;
    error: string;
    message: string;
    constructor(code: string, message: string, statusCode?: number) {
        this.error = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}
