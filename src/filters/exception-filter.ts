import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(public reflector: Reflector) {}
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const data = exception.getResponse() as any;
    const parsed = typeof data === 'string' ? data : data?.message;

    const message = Array.isArray(parsed)
      ? parsed.map(({ target: _t, children: _c, ...rest }) => rest)
      : parsed;

    response.status(status).json({
      success: false,
      message,
      statusCode: status,
      path: request.url,
    });
  }
}
