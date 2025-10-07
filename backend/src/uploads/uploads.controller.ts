import { Controller, Post, Get, Body, UseGuards, Req, Query } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { CreateUploadDto } from './dto/create-upload.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('presign')
  async presign(@Body() dto: CreateUploadDto, @Req() req: any) {
    return this.uploadsService.getPresignedUrl(dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('download')
  async download(@Query('key') key: string) {
    return this.uploadsService.getDownloadUrl(key);
  }
}
