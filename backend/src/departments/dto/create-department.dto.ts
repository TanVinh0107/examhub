import { IsString } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  schoolId: string; // FK tham chiếu đến School
}
