import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { QueryExamDto } from './dto/query-exam.dto';
import { Prisma, ExamStatus } from '@prisma/client';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  // Tạo exam mới
  async create(data: CreateExamDto, userId: string) {
    return this.prisma.exam.create({
      data: { ...data, uploaderId: userId, status: ExamStatus.PENDING },
    });
  }

  // Lấy danh sách exam với filter + pagination + search
  async findAll(q: QueryExamDto) {
    const {
      page = 1,
      limit = 10,
      schoolId,
      departmentId,
      subjectId,
      year,
      q: text,
      sortBy = 'createdAt',
      order = 'desc',
    } = q;

    const where: Prisma.ExamWhereInput = {
      deletedAt: null, // soft delete
      schoolId: schoolId || undefined,
      departmentId: departmentId || undefined,
      subjectId: subjectId || undefined,
      year: year || undefined,
    };

    if (text) {
      where.OR = [
        { title: { contains: text, mode: 'insensitive' } },
        { description: { contains: text, mode: 'insensitive' } },
      ];
    }

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

  // Lấy 1 exam
  async findOne(id: string) {
    const exam = await this.prisma.exam.findFirst({
      where: { id, deletedAt: null },
      include: { school: true, department: true, subject: true, uploader: true },
    });
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  // Update exam
  async update(id: string, data: UpdateExamDto) {
    return this.prisma.exam.update({ where: { id }, data });
  }

  // Soft delete
  async remove(id: string) {
    return this.prisma.exam.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Approve exam (ADMIN)
  async approve(id: string) {
    return this.prisma.exam.update({
      where: { id },
      data: { status: ExamStatus.APPROVED },
    });
  }

  // Lấy exam theo uploader (user)
  async findByUploader(userId: string) {
    return this.prisma.exam.findMany({
      where: { uploaderId: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { school: true, department: true, subject: true },
    });
  }

  // Lấy exam theo status (ADMIN)
  async findByStatus(status: ExamStatus) {
    return this.prisma.exam.findMany({
      where: { status, deletedAt: null },
      include: { school: true, department: true, subject: true, uploader: true },
    });
  }
}
