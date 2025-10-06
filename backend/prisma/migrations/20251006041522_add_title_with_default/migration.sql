-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Untitled';

-- CreateIndex
CREATE INDEX "Exam_status_year_idx" ON "Exam"("status", "year");

-- CreateIndex
CREATE INDEX "Exam_schoolId_departmentId_subjectId_idx" ON "Exam"("schoolId", "departmentId", "subjectId");
