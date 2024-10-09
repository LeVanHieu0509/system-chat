'use strict';

export interface IBadRequestExceptionResponse {
  statusCode: number;
  message: unknown;
  error: string;
}

export interface IResponse {
  status: number;
  message: string;
  data: unknown;
  page?: number;
  totalRecords?: number;
}
