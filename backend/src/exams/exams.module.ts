import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesGuard } from '../auth/roles.guard';
import { S3Module } from '../s3/s3.module'; // ✅ Thêm import này

@Module({
  imports: [PrismaModule, S3Module], // ✅ Thêm S3Module vào đây
  controllers: [ExamsController],
  providers: [ExamsService, RolesGuard],
})
export class ExamsModule {}
