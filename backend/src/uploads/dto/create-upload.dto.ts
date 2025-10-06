// src/uploads/dto/create-upload.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateUploadDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  fileType: string;

  @IsString()
  @IsNotEmpty()
  schoolId: string;

  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @IsString()
  @IsNotEmpty()
  subjectId: string;

  @IsNumber()
  @IsNotEmpty()
  year: number;

  @IsNumber()
  @IsOptional()
  credits?: number;

  @IsNumber()
  @IsOptional()
  durationMin?: number;
}
