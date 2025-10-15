import { PrismaClient } from '@prisma/client';

import * as bcrypt from 'bcryptjs';



const prisma = new PrismaClient();

async function main() {
  // 🔹 1. Tạo user admin
  const email = 'admin@example.com';
  const password = '123456';
  const hash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: hash,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  // 🔹 2. Tạo trường
  const school = await prisma.school.upsert({
    where: { slug: 'dai-hoc-khoa-hoc' },
    update: {},
    create: {
      name: 'Đại Học Khoa Học',
      slug: 'dai-hoc-khoa-hoc',
    },
  });

  // 🔹 3. Tạo khoa
  const department = await prisma.department.upsert({
    where: { slug: 'cntt' },
    update: {},
    create: {
      name: 'Công Nghệ Thông Tin',
      slug: 'cntt',
      schoolId: school.id,
    },
  });

  // 🔹 4. Tạo môn học
  const subject = await prisma.subject.upsert({
    where: { slug: 'giai-tich' },
    update: {},
    create: {
      name: 'Giải Tích',
      slug: 'giai-tich',
      departmentId: department.id,
    },
  });

  console.log('✅ Seeded data:');
  console.table({ admin: admin.email, school: school.name, department: department.name, subject: subject.name });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
