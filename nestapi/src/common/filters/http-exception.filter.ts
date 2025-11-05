import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // 提取错误信息
    let message = '发生错误';
    let details = {};

    if (typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as any;
      message = responseObj.message || message;
      details = responseObj;
    } else {
      message = exceptionResponse as string;
    }

    // 记录错误日志
    this.logger.error(`[${request.method} ${request.url}] [${status}] ${message}`, exception.stack);

    // 返回统一的错误响应格式
    response.status(status).json({
      code: status,
      message,
      data: null,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    });
  }
}

/**
 * 全局异常过滤器 - 捕获所有未处理的异常
 * 必须在 main.ts 中注册
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // 对于已是 HttpException 的异常，使用 HttpExceptionFilter 处理
    if (exception instanceof HttpException) {
      return;
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '内部服务器错误';
    let errorDetails = {};

    // 捕获并记录具体的错误信息
    if (exception instanceof Error) {
      message = exception.message;
      errorDetails = {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
      };
      this.logger.error(
        `[${request.method} ${request.url}] Unhandled Exception: ${exception.name}: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error(
        `[${request.method} ${request.url}] Unknown Exception`,
        JSON.stringify(exception),
      );
    }

    // 返回统一的错误响应格式
    response.status(status).json({
      code: status,
      message,
      details: errorDetails,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
