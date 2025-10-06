import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { CreateUploadDto } from './dto/create-upload.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  // API tạo pre-signed URL để upload trực tiếp lên S3
  @UseGuards(JwtAuthGuard)
  @Post('presign')
  async presign(@Body() dto: CreateUploadDto, @Req() req: any) {
    const userId = req.user.userId;
    return this.uploadsService.getPresignedUrl(dto, userId);
  }
}
