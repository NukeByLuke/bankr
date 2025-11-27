/*
  Warnings:

  - You are about to drop the column `description` on the `loans` table. All the data in the column will be lost.
  - You are about to drop the column `interestRate` on the `loans` table. All the data in the column will be lost.
  - You are about to drop the column `isPaidOff` on the `loans` table. All the data in the column will be lost.
  - You are about to drop the column `lenderName` on the `loans` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyPayment` on the `loans` table. All the data in the column will be lost.
  - You are about to drop the column `principalAmount` on the `loans` table. All the data in the column will be lost.
  - You are about to drop the column `remainingAmount` on the `loans` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `loans` table. All the data in the column will be lost.
  - Added the required column `amount` to the `loans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `loans` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `loans` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "loans" DROP CONSTRAINT "loans_userId_fkey";

-- DropIndex
DROP INDEX "loans_userId_idx";

-- AlterTable
ALTER TABLE "loans" DROP COLUMN "description",
DROP COLUMN "interestRate",
DROP COLUMN "isPaidOff",
DROP COLUMN "lenderName",
DROP COLUMN "monthlyPayment",
DROP COLUMN "principalAmount",
DROP COLUMN "remainingAmount",
DROP COLUMN "userId",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "startDate" SET DEFAULT CURRENT_TIMESTAMP;

-- DropEnum
DROP TYPE "LoanType";
