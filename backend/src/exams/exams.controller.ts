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
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { QueryExamDto } from './dto/query-exam.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';
import { S3Service } from '../s3/s3.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exams')
export class ExamsController {
  constructor(
    private readonly examsService: ExamsService,
    private readonly s3Service: S3Service,
  ) {}

  // ✅ Upload file lên MinIO/S3 (yêu cầu đăng nhập)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const key = await this.s3Service.uploadFile(file);
    return {
      fileKey: key,
      fileType: file.mimetype,
    };
  }

  // ✅ Tạo exam mới
  @Post()
  async create(@Body() dto: CreateExamDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.examsService.create(dto, userId);
  }

  // ✅ Public - Lấy danh sách exam
  @UseGuards() // bỏ guard để public
  @Get()
  async findAll(@Query() query: QueryExamDto) {
    const result = await this.examsService.findAll(query);

    return {
      data: result.data.map((e) => ({
        id: e.id,
        title: e.title || 'Không có tiêu đề',
        year: e.year,
        views: e.views,
        status: e.status,
        description: e.description,
        fileKey: e.fileUrl,
        fileType: e.fileType,
      })),
      meta: result.meta,
    };
  }

  // ✅ Public - Lấy chi tiết exam
  @UseGuards()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  // ✅ Trả về presigned URL để tải file
  @Get(':id/download')
  async getDownloadUrl(@Param('id') id: string) {
    const exam = await this.examsService.findOne(id);

    if (!exam || !exam.fileUrl) {
      throw new NotFoundException('Không tìm thấy đề thi hoặc file');
    }

    const url = await this.s3Service.getPresignedUrl(exam.fileUrl);
    return { url };
  }

  // ✅ Lấy exam đã upload của user hiện tại
  @Get('my-exams')
  async myExams(@Req() req: any) {
    const userId = req.user.userId;
    return this.examsService.findByUploader(userId);
  }

  // ✅ Cập nhật exam
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateExamDto) {
    return this.examsService.update(id, dto);
  }

  // 🔐 Admin - Xoá exam
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.examsService.remove(id);
  }

  // 🔐 Admin - Duyệt exam
  @Roles(Role.ADMIN)
  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    return this.examsService.approve(id);
  }

  // 🔐 Admin - Lọc exam theo trạng thái
  @Roles(Role.ADMIN)
  @Get('status/:status')
  async findByStatus(@Param('status') status: string) {
    return this.examsService.findByStatus(status as any);
  }
}
