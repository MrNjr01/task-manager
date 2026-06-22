-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "reference_task_id" UUID;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_reference_task_id_fkey" FOREIGN KEY ("reference_task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
