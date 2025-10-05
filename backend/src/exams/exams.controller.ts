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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { QueryExamDto } from './dto/query-exam.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  // 📌 Upload file riêng, trả về fileUrl
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

  // 📌 Tạo exam (có thể gắn fileUrl lấy từ bước upload)
  @Post()
  create(@Body() dto: CreateExamDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.examsService.create(dto, userId);
  }

  // 📌 Public GET all
  @UseGuards()
  @Get()
  findAll(@Query() query: QueryExamDto) {
    return this.examsService.findAll(query);
  }

  // 📌 Public GET by id
  @UseGuards()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  // 📌 Update exam
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExamDto) {
    return this.examsService.update(id, dto);
  }

  // 📌 Chỉ ADMIN mới được xóa exam
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examsService.remove(id);
  }
}
