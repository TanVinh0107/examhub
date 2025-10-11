import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { QueryExamDto } from './dto/query-exam.dto';
import { Prisma, ExamStatus } from '@prisma/client';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  // ✅ Tạo exam mới
  async create(data: CreateExamDto, userId: string) {
    return this.prisma.exam.create({
      data: {
        ...data,
        uploaderId: userId,
        status: ExamStatus.PENDING,
      },
    });
  }

  // ✅ Lấy danh sách exam (lọc + tìm kiếm + phân trang)
  async findAll(q: QueryExamDto) {
    const {
      page = 1,
      limit = 10,
      schoolId,
      departmentId,
      subjectId,
      year,
      q: search,
      sortBy = 'createdAt',
      order = 'desc',
    } = q;

    const where: Prisma.ExamWhereInput = {
      deletedAt: null,
      schoolId: schoolId || undefined,
      departmentId: departmentId || undefined,
      subjectId: subjectId || undefined,
      year: year || undefined,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.exam.findMany({
        where,
        include: {
          school: true,
          department: true,
          subject: true,
          uploader: true,
        },
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

  // ✅ Lấy chi tiết exam
  async findOne(id: string) {
    const exam = await this.prisma.exam.findFirst({
      where: { id, deletedAt: null },
      include: {
        school: true,
        department: true,
        subject: true,
        uploader: true,
      },
    });

    if (!exam) throw new NotFoundException('Không tìm thấy đề thi');
    return exam;
  }

  // ✅ Cập nhật exam
  async update(id: string, data: UpdateExamDto) {
    return this.prisma.exam.update({
      where: { id },
      data,
    });
  }

  // ✅ Soft delete exam
  async remove(id: string) {
    return this.prisma.exam.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ✅ Duyệt exam (Admin)
  async approve(id: string) {
    return this.prisma.exam.update({
      where: { id },
      data: { status: ExamStatus.APPROVED },
    });
  }

  // ✅ Lấy exam do user đã upload
  async findByUploader(userId: string) {
    return this.prisma.exam.findMany({
      where: {
        uploaderId: userId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        school: true,
        department: true,
        subject: true,
      },
    });
  }

  // ✅ Lọc exam theo trạng thái (Admin)
  async findByStatus(status: ExamStatus) {
    return this.prisma.exam.findMany({
      where: {
        status,
        deletedAt: null,
      },
      include: {
        school: true,
        department: true,
        subject: true,
        uploader: true,
      },
    });
  }
}
