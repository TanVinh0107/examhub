import { IsString } from 'class-validator';

export class CreateSchoolDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;
}
