-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "reference_task_id" TEXT;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_reference_task_id_fkey" FOREIGN KEY ("reference_task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
