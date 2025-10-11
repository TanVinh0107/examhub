import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.getOrThrow('AWS_REGION'),
      endpoint: `http://${this.configService.getOrThrow('MINIO_ENDPOINT')}:${this.configService.getOrThrow('MINIO_PORT')}`,
      credentials: {
        accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true, // ✅ Quan trọng với MinIO
    });

    this.bucket = this.configService.getOrThrow('MINIO_BUCKET');
  }

  // ✅ Upload file lên S3/MinIO và trả về key
  async uploadFile(file: Express.Multer.File): Promise<string> {
    const extension = extname(file.originalname);
    const key = `${uuid()}${extension}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3.send(command);
      this.logger.debug(`✔️ Uploaded file ${key} to bucket ${this.bucket}`);
      return key;
    } catch (error) {
      this.logger.error('❌ Failed to upload file to S3:', error);
      throw new InternalServerErrorException('Upload failed');
    }
  }

  // ✅ Tạo URL download tạm thời (presigned)
  async getPresignedUrl(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3, command, {
        expiresIn: 3600, // 1 giờ
      });

      this.logger.debug(`✔️ Generated presigned URL for ${key}`);
      return signedUrl;
    } catch (error) {
      this.logger.error('❌ Failed to generate presigned URL:', error);
      throw new InternalServerErrorException('Presigned URL failed');
    }
  }
}
