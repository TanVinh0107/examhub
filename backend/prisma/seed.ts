import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Tạo trường
  const school = await prisma.school.upsert({
    where: { slug: 'dai-hoc-khoa-hoc' },
    update: {},
    create: {
      name: 'Đại Học Khoa Học',
      slug: 'dai-hoc-khoa-hoc',
    },
  });

  // Tạo khoa
  const department = await prisma.department.upsert({
    where: { slug: 'cntt' },
    update: {},
    create: {
      name: 'Công Nghệ Thông Tin',
      slug: 'cntt',
      schoolId: school.id,
    },
  });

  // Tạo môn
  const subject = await prisma.subject.upsert({
    where: { slug: 'giai-tich' },
    update: {},
    create: {
      name: 'Giải Tích',
      slug: 'giai-tich',
      departmentId: department.id,
    },
  });

  console.log('Seeded:', { school, department, subject });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
