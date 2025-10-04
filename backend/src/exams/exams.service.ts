import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateExamDto) {
    return this.prisma.exam.create({ data });
  }

  findAll() {
    return this.prisma.exam.findMany({
      include: {
        school: true,
        department: true,
        subject: true,
        uploader: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.exam.findUnique({
      where: { id },
      include: {
        school: true,
        department: true,
        subject: true,
        uploader: true,
      },
    });
  }

  update(id: string, data: UpdateExamDto) {
    return this.prisma.exam.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.exam.delete({ where: { id } });
  }
}
