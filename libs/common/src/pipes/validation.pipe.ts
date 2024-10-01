import {
  BadRequestException,
  Optional,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

/**
 * MainValidationPipe
 *
 * @author HoaiNT
 */
export class MainValidationPipe extends ValidationPipe {
  constructor(@Optional() options: ValidationPipeOptions = {}) {
    super({
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
      ...options,
    });
  }

  exceptionFactory: any = (errors: ValidationError[]) => {
    const transformedErrors = errors
      .map((error) => this.mapChildren(error))
      .reduce(
        (previousErrors, currentError) => [...previousErrors, ...currentError],
        [],
      )
      .filter((error) => !!Object.keys(error.constraints).length)
      .map((error) => ({
        field: error.property,
        message: Object.values(error.constraints)[0],
      }));

    throw new BadRequestException(transformedErrors);
  };

  private mapChildren(error: ValidationError): ValidationError[] {
    if (!(error.children && error.children.length)) {
      return [error];
    }
    const validationErrors = [];
    for (const item of error.children) {
      const hasChildren = item.children && item.children.length;
      const key = hasChildren
        ? `${error.property}[${item.property}]`
        : `${error.property}.${item.property}`;
      if (hasChildren) {
        for (const i of item.children) {
          validationErrors.push({ ...i, property: `${key}${i.property}` });
        }
      }
      validationErrors.push(
        this.prependConstraints({ ...item, property: key }),
      );
    }
    return validationErrors;
  }

  private prependConstraints(error: ValidationError): ValidationError {
    const constraints = {};
    for (const key in error.constraints) {
      constraints[key] = error.constraints[key];
    }
    return { ...error, constraints };
  }
}
