-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('REGISTER', 'TRANSFER');

-- CreateTable
CREATE TABLE "CustodialTasks" (
    "id" SERIAL NOT NULL,
    "taskType" "TaskType" NOT NULL,
    "taskRef" TEXT NOT NULL,

    CONSTRAINT "CustodialTasks_pkey" PRIMARY KEY ("id")
);
