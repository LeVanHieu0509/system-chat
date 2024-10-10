'use strict';

import { Response } from 'express';

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

export interface ResponseCustom extends Response {
  user: string;
}
