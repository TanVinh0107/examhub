import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateSchoolDto) {
    return this.prisma.school.create({ data });
  }

  findAll() {
    return this.prisma.school.findMany();
  }

  findOne(id: string) {
    return this.prisma.school.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateSchoolDto) {
    return this.prisma.school.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.school.delete({ where: { id } });
  }
}
