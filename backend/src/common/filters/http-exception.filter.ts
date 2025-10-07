import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; // ✅ Cú pháp đúng cho Prisma 6.x
import { Request, Response } from 'express';


/**
 * Bộ lọc lỗi toàn cục – chuyển các lỗi hệ thống thành HTTP error có nghĩa
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = null;

    // 1️⃣ Nếu là HttpException (do bạn throw)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = (res as any).message || exception.message;
      details = (res as any).error || null;
    }

    // 2️⃣ Nếu là lỗi Prisma (các mã lỗi P20xx)
    else if (exception instanceof PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;

      switch (exception.code) {
        case 'P2002':
          message = 'Dữ liệu bị trùng lặp (unique constraint failed)';
          break;
        case 'P2003':
          message = 'Tham chiếu không hợp lệ (foreign key violation)';
          break;
        case 'P2025':
          message = 'Không tìm thấy bản ghi cần thao tác';
          break;
        default:
          message = `Lỗi cơ sở dữ liệu: ${exception.code}`;
      }
    }

    // 3️⃣ Nếu là lỗi AWS SDK (S3 / MinIO)
    else if (exception instanceof Error && exception.name === 'TimeoutError') {
      status = HttpStatus.REQUEST_TIMEOUT;
      message = 'Kết nối đến S3 bị timeout';
    } else if (exception instanceof Error && exception.message?.includes('AWS')) {
      status = HttpStatus.BAD_GATEWAY;
      message = 'Lỗi kết nối đến AWS/MinIO';
    }

    // 4️⃣ Nếu là lỗi không xác định
    else {
      console.error('❌ Unhandled error:', exception);
    }

    response.status(status).json({
      statusCode: status,
      message,
      details,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
