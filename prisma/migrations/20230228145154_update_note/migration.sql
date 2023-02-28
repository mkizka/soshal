/*
  Warnings:

  - Added the required column `published` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "published" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;
