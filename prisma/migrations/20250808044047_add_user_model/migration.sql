/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `reportId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `officerPublicKey` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `userPublicKey` on the `Report` table. All the data in the column will be lost.
  - Added the required column `report_id` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoleEnum" AS ENUM ('OFFICER');

-- CreateEnum
CREATE TYPE "InstanceEnum" AS ENUM ('POLRI_PPA', 'UPTD_PPA', 'KOMNAS_PEREMPUAN', 'KPAI', 'LBH_OMS');

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_reportId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "createdAt",
DROP COLUMN "reportId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "report_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "createdAt",
DROP COLUMN "officerPublicKey",
DROP COLUMN "updatedAt",
DROP COLUMN "userPublicKey",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "officer_public_key" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_public_key" TEXT;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "instance" "InstanceEnum" NOT NULL,
    "role" "RoleEnum" NOT NULL DEFAULT 'OFFICER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_reportId_fkey" FOREIGN KEY ("report_id") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
