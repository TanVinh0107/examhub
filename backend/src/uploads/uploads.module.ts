import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';

import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';

@Module({
  imports: [ConfigModule, PrismaModule],  // cần để inject ConfigService + PrismaService
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService], // nếu chỗ khác cần dùng UploadsService
})
export class UploadsModule {}
