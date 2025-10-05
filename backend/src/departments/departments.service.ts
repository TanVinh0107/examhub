import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateDepartmentDto) {
    return this.prisma.department.create({ data });
  }

  findAll() {
    return this.prisma.department.findMany({
      include: { school: true },
    });
  }

  findOne(id: string) {
    return this.prisma.department.findUnique({
      where: { id },
      include: { school: true },
    });
  }

  update(id: string, data: UpdateDepartmentDto) {
    return this.prisma.department.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.department.delete({ where: { id } });
  }
}
