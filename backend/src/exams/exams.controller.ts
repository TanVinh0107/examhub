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

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  // Upload file riêng, trả về fileUrl
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

  // Tạo exam mới
  @Post()
  async create(@Body() dto: CreateExamDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.examsService.create(dto, userId);
  }

  // Lấy danh sách exam với filter, pagination, search (public)
  @UseGuards()
  @Get()
  async findAll(@Query() query: QueryExamDto) {
    return this.examsService.findAll(query);
  }

  // Lấy 1 exam theo id (public)
  @UseGuards()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  // Lấy exam của user đang login
  @Get('my-exams')
  async myExams(@Req() req: any) {
    const userId = req.user.userId;
    return this.examsService.findByUploader(userId);
  }

  // Update exam
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateExamDto) {
    return this.examsService.update(id, dto);
  }

  // Soft delete exam (chỉ admin)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.examsService.remove(id);
  }

  // Approve exam (chỉ admin)
  @Roles('ADMIN')
  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    return this.examsService.approve(id);
  }

  // Lấy exam theo status (admin)
  @Roles('ADMIN')
  @Get('status/:status')
  async findByStatus(@Param('status') status: string) {
    return this.examsService.findByStatus(status as any); // convert sang enum nếu cần
  }
}
