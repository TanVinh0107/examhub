import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Logger Pino
  app.useLogger(app.get(Logger));

  // Global ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Helmet để tăng bảo mật
  app.use(helmet());

  // Cho phép CORS
  app.enableCors({
    origin: '*', // nếu FE chạy ở domain riêng thì điền cụ thể vào đây
    credentials: true,
  });

  // Prefix cho tất cả route
  app.setGlobalPrefix('api');

  // ⚡ Phục vụ file tĩnh: upload ảnh/pdf...
  // Ví dụ: ảnh lưu trong thư mục "uploads"
  // khi truy cập: http://localhost:4000/uploads/tenfile.jpg
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}/api`);
  console.log(`📂 Static files served at http://localhost:${port}/uploads`);
}
bootstrap();
