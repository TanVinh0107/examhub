import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ExamsModule } from './exams/exams.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // 👈 load .env toàn cục
    PrismaModule,
    ExamsModule,
  ],
})
export class AppModule {}
