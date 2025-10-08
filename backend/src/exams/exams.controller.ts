import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';

import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { QueryExamDto } from './dto/query-exam.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  // ✅ Upload file (yêu cầu login)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/exams',
        filename: (req, file, cb) => {
          const uniqueName = uuid() + extname(file.originalname);
          cb(null, uniqueName);
        },
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { fileUrl: `/uploads/exams/${file.filename}` };
  }

  // ✅ Tạo exam mới (yêu cầu login)
  @Post()
  async create(@Body() dto: CreateExamDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.examsService.create(dto, userId);
  }

  // ✅ Public - Lấy danh sách exam
  @UseGuards()
  @Get()
  async findAll(@Query() query: QueryExamDto) {
    return this.examsService.findAll(query);
  }

  // ✅ Public - Lấy chi tiết đề
  @UseGuards()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  // ✅ Lấy exam do người dùng đang login đã upload
  @Get('my-exams')
  async myExams(@Req() req: any) {
    const userId = req.user.userId;
    return this.examsService.findByUploader(userId);
  }

  // ✅ Cập nhật exam (yêu cầu login)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateExamDto) {
    return this.examsService.update(id, dto);
  }

  // 🔐 Chỉ admin được xoá
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.examsService.remove(id);
  }

  // 🔐 Chỉ admin được duyệt
  @Roles(Role.ADMIN)
  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    return this.examsService.approve(id);
  }

  // 🔐 Chỉ admin được lọc theo trạng thái
  @Roles(Role.ADMIN)
  @Get('status/:status')
  async findByStatus(@Param('status') status: string) {
    return this.examsService.findByStatus(status as any);
  }
}
