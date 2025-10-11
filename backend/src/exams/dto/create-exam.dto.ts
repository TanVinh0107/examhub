import { IsInt, IsOptional, IsString, IsUrl, Min, IsIn } from 'class-validator';

export class CreateExamDto {
  @IsInt()
  @Min(1900)
  year: number;

  @IsOptional()
  @IsInt()
  credits?: number;

  @IsOptional()
  @IsInt()
  durationMin?: number;

  @IsString()
  fileUrl: string; // có thể là presigned URL

  @IsString()
  fileType: string; // vd: application/pdf, image/png

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  // FK (cuid/chuỗi, không check UUID)
  @IsString()
  schoolId: string;

  @IsString()
  departmentId: string;

  @IsString()
  subjectId: string;

  // người upload (nếu có sẵn)
  @IsOptional()
  @IsString()
  uploaderId?: string;

  // trạng thái khởi tạo (mặc định PENDING nếu không truyền)
  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}