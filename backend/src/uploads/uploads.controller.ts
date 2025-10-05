import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('uploads')
export class UploadsController {
  @Post('single')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      },
    }),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (_req, file, cb) => {
      const allow = ['application/pdf', 'image/png', 'image/jpeg'];
      if (!allow.includes(file.mimetype)) return cb(new BadRequestException('Invalid file type'), false);
      cb(null, true);
    },
  }))
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    // file được serve qua /uploads/<filename> (đã set ở main.ts)
    return { url: `/uploads/${file.filename}`, mime: file.mimetype, size: file.size };
  }
}
