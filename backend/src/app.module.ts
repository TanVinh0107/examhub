import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { ExamsModule } from './exams/exams.module';
import { SchoolsModule } from './schools/schools.module';
import { DepartmentsModule } from './departments/departments.module';
import { SubjectsModule } from './subjects/subjects.module';
import { AuthModule } from './auth/auth.module';
import { UploadsModule } from './uploads/uploads.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { singleLine: true } }
          : undefined,
        level: process.env.LOG_LEVEL || 'info',
        // tự động log request/response
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
})
export class AppModule {}
