/*
  Warnings:

  - You are about to drop the column `description` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `nextBilling` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `subscriptions` table. All the data in the column will be lost.
  - The `category` column on the `subscriptions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `periodLength` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodType` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_userId_fkey";

-- DropIndex
DROP INDEX "subscriptions_nextBilling_idx";

-- DropIndex
DROP INDEX "subscriptions_userId_idx";

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "description",
DROP COLUMN "endDate",
DROP COLUMN "frequency",
DROP COLUMN "isActive",
DROP COLUMN "name",
DROP COLUMN "nextBilling",
DROP COLUMN "startDate",
DROP COLUMN "userId",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "nextPayment" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "periodLength" INTEGER NOT NULL,
ADD COLUMN     "periodType" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
DROP COLUMN "category",
ADD COLUMN     "category" TEXT;
