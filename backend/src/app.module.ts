import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { ExamsModule } from './exams/exams.module';
import { SchoolsModule } from './schools/schools.module';
import { DepartmentsModule } from './departments/departments.module';
import { SubjectsModule } from './subjects/subjects.module';
import { AuthModule } from './auth/auth.module';
import { UploadsModule } from './uploads/uploads.module';

import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';

import { S3Service } from './s3/s3.service'; // ✅ S3Service
import { S3Module } from './s3/s3.module';   // ✅ nếu muốn tách riêng module
// (Tùy chọn: có thể khai báo trực tiếp ở providers hoặc tách riêng module như dưới đây)

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { singleLine: true } }
          : undefined,
        level: process.env.LOG_LEVEL || 'info',
        autoLogging: true,
      },
    }),
    PrismaModule,
    AuthModule,
    ExamsModule,
    SchoolsModule,
    DepartmentsModule,
    SubjectsModule,
    UploadsModule,
    S3Module, // ✅ Import S3Module chứa S3Service
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
