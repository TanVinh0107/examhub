// app.module.ts
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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // ✅ bắt buộc xác thực
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,   // ✅ bắt buộc kiểm tra vai trò
    },
  ],
})
export class AppModule {}
