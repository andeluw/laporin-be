/*
  Warnings:

  - Made the column `details` on table `Report` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "CategoryEnum" AS ENUM ('KEKERASAN_DALAM_RUMAH_TANGGA', 'KEKERASAN_SEKSUAL', 'KEKERASAN_PADA_ANAK', 'PERDAGANGAN_ORANG', 'SIBER_KEKERASAN_BERBASIS_GENDER', 'KEKERASAN_LAINNYA');

-- CreateEnum
CREATE TYPE "UrgencyEnum" AS ENUM ('Kritis', 'Tinggi', 'Sedang');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "category" "CategoryEnum",
ADD COLUMN     "handler_id" TEXT,
ADD COLUMN     "recommended_instance" "InstanceEnum",
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "urgency" "UrgencyEnum",
ALTER COLUMN "details" SET NOT NULL,
ALTER COLUMN "details" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_handler_id_fkey" FOREIGN KEY ("handler_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
