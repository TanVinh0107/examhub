import { IsString } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  departmentId: string; // FK tham chiếu đến Department
}
