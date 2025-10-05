import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateSubjectDto) {
    return this.prisma.subject.create({ data });
  }

  findAll() {
    return this.prisma.subject.findMany({
      include: { department: true },
    });
  }

  findOne(id: string) {
    return this.prisma.subject.findUnique({
      where: { id },
      include: { department: true },
    });
  }

  update(id: string, data: UpdateSubjectDto) {
    return this.prisma.subject.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.subject.delete({ where: { id } });
  }
}
