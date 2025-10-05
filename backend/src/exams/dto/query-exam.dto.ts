import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryExamDto {
  @ApiPropertyOptional() @IsOptional() @IsString() schoolId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() subjectId?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() year?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() q?: string; // text search mô tả

  @ApiPropertyOptional({ default: 1 }) @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 10 }) @Type(() => Number) @IsInt() @Min(1) limit = 10;

  @ApiPropertyOptional({ default: 'createdAt' }) @IsOptional() @IsString() sortBy?: 'createdAt'|'year'|'views';
  @ApiPropertyOptional({ default: 'desc' }) @IsOptional() @IsString() order?: 'asc'|'desc';
}
