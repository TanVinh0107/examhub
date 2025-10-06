// src/uploads/uploads.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUploadDto } from './dto/create-upload.dto';

@Injectable()
export class UploadsService {
  private s3: AWS.S3;
  private bucket: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const region = this.config.get<string>('AWS_REGION');
    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');
    const bucket = this.config.get<string>('AWS_S3_BUCKET');

    if (!region || !accessKeyId || !secretAccessKey || !bucket) {
      throw new Error('❌ Missing AWS S3 configuration in .env');
    }

    this.bucket = bucket;
    this.s3 = new AWS.S3({
      region,
      accessKeyId,
      secretAccessKey,
      signatureVersion: 'v4',
      endpoint: 'http://localhost:9000', // MinIO local
      s3ForcePathStyle: true,
    });
  }

  async getPresignedUrl(dto: CreateUploadDto, userId: string) {
    // ✅ Validate file type + size
    const allowedImages = ['image/png', 'image/jpeg'];
    const allowedDocs = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (![...allowedImages, ...allowedDocs].includes(dto.fileType)) {
      throw new BadRequestException('❌ Invalid file type');
    }

    // Nếu là ảnh => giới hạn 5MB, còn lại 50MB
    const maxSize = allowedImages.includes(dto.fileType)
      ? 5 * 1024 * 1024 // 5MB
      : 50 * 1024 * 1024; // 50MB

    // (Client cần đảm bảo size trước khi upload, ở đây ta chỉ log cảnh báo)
    console.log(`ℹ️ File type: ${dto.fileType}, max allowed size = ${maxSize / 1024 / 1024}MB`);

    const key = `exams/${userId}/${Date.now()}_${dto.fileName}`;

    const url = await this.s3.getSignedUrlPromise('putObject', {
      Bucket: this.bucket,
      Key: key,
      ContentType: dto.fileType,
      Expires: 300, // URL sống 5 phút
    });

    // ✅ Save exam metadata vào DB
    const exam = await this.prisma.exam.create({
      data: {
        title: dto.fileName,
        fileUrl: key,
        fileType: dto.fileType,
        schoolId: dto.schoolId,
        departmentId: dto.departmentId,
        subjectId: dto.subjectId,
        uploaderId: userId,
        status: 'PENDING',
        year: dto.year,
        credits: dto.credits,
        durationMin: dto.durationMin,
      },
    });

    console.log(`✅ Presigned URL created for key: ${key}`);

    return { presignedUrl: url, key, examId: exam.id };
  }
}
