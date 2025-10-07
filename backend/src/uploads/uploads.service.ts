import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUploadDto } from './dto/create-upload.dto';

@Injectable()
export class UploadsService {
  private s3: AWS.S3;
  private bucket: string;
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
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
      endpoint: 'http://localhost:9000', // ✅ MinIO local endpoint
      s3ForcePathStyle: true,            // ✅ Bắt buộc cho MinIO
    });

    this.logger.log(`✅ S3 client initialized for bucket: ${this.bucket}`);
  }

  /** 
   * 🔹 Tạo presigned PUT URL (upload)
   */
  async getPresignedUrl(dto: CreateUploadDto, userId: string) {
    const allowedImages = ['image/png', 'image/jpeg'];
    const allowedDocs = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (![...allowedImages, ...allowedDocs].includes(dto.fileType)) {
      throw new BadRequestException('❌ Invalid file type');
    }

    // 🔸 Giới hạn dung lượng
    const maxSizeMB = allowedImages.includes(dto.fileType) ? 5 : 50;
    this.logger.warn(
      `ℹ️ Upload type: ${dto.fileType} | max allowed size: ${maxSizeMB}MB`,
    );

    const key = `exams/${userId}/${Date.now()}_${dto.fileName}`;

    const presignedUrl = await this.s3.getSignedUrlPromise('putObject', {
      Bucket: this.bucket,
      Key: key,
      ContentType: dto.fileType,
      Expires: 300, // 5 phút
    });

    // 🔹 Lưu metadata vào DB
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

    this.logger.log(`✅ Presigned PUT URL created: ${key}`);
    return { presignedUrl, key, examId: exam.id };
  }

  /** 
   * 🔹 Tạo presigned GET URL (download)
   */
  async getDownloadUrl(key: string) {
    if (!key) throw new BadRequestException('Missing file key');

    const presignedUrl = await this.s3.getSignedUrlPromise('getObject', {
      Bucket: this.bucket,
      Key: key,
      Expires: 300, // 5 phút để tải
    });

    this.logger.log(`📥 Generated presigned GET for: ${key}`);
    return { downloadUrl: presignedUrl };
  }
}
