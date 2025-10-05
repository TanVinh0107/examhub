import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [ExamsController],
  providers: [ExamsService, RolesGuard],
})
export class ExamsModule {}
