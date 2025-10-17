import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

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

  @Type(() => Number)
  @IsInt()
  @Min(1900)
  year: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  credits?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  durationMin?: number;
}
