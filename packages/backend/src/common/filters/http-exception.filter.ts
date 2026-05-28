import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    this.logger.error(`HTTP Exception: ${status}`, exception);

    response.status(status).json({
      success: false,
      error: (exceptionResponse as any).message || exception.message,
      code: status,
      timestamp: new Date(),
    });
  }
}
