// src/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const school = await prisma.school.upsert({
    where: { id: 'school-1' },
    update: {},
    create: { 
      id: 'school-1', 
      name: 'Trường Đại học Bách Khoa', 
      slug: 'truong-dai-hoc-bach-khoa' // 👈 bắt buộc
    },
  });

  const department = await prisma.department.upsert({
    where: { id: 'dep-1' },
    update: {},
    create: { 
      id: 'dep-1', 
      name: 'Khoa CNTT', 
      slug: 'khoa-cntt', // 👈 thêm slug nếu bảng Department cũng có field này
      schoolId: school.id 
    },
  });

  const subject = await prisma.subject.upsert({
    where: { id: 'sub-1' },
    update: {},
    create: { 
      id: 'sub-1', 
      name: 'Cơ sở dữ liệu', 
      slug: 'co-so-du-lieu', // 👈 thêm slug nếu Subject cũng có
      departmentId: department.id 
    },
  });

  console.log({ school, department, subject });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
