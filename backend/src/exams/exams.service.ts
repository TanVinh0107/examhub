import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { QueryExamDto } from './dto/query-exam.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateExamDto, userId: string) {
    return this.prisma.exam.create({
      data: { ...data, uploaderId: userId },
    });
  }

  async findAll(q: QueryExamDto) {
    const { page, limit, schoolId, departmentId, subjectId, year, q: text, sortBy='createdAt', order='desc' } = q;
    const where: Prisma.ExamWhereInput = {
      schoolId: schoolId || undefined,
      departmentId: departmentId || undefined,
      subjectId: subjectId || undefined,
      year: year || undefined,
      ...(text ? {
        OR: [
          { description: { contains: text, mode: 'insensitive' } },
          // có thể mở rộng thêm các field khác
        ],
      } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.exam.findMany({
        where,
        include: { school: true, department: true, subject: true, uploader: true },
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.exam.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.exam.findUnique({
      where: { id },
      include: { school: true, department: true, subject: true, uploader: true },
    });
  }

  async update(id: string, data: UpdateExamDto) {
    return this.prisma.exam.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.exam.delete({ where: { id } });
  }
}
