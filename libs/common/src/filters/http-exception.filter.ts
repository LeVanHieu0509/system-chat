import {
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { VALIDATE_MESSAGE } from '../validate-message';
import { IS_PRODUCTION } from 'libs/config';
import { AppError } from '../errors';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException) {
    if (exception.getResponse) return exception.getResponse();
    console.log(`HttpExceptionFilter`, exception.stack);
    const message = IS_PRODUCTION
      ? VALIDATE_MESSAGE.SOMETHING_WENT_WRONG
      : exception.message;
    return new AppError(
      exception.name,
      message,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
