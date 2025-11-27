-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionCategory" ADD VALUE 'TRANSPORTATION';
ALTER TYPE "TransactionCategory" ADD VALUE 'UTILITIES';
ALTER TYPE "TransactionCategory" ADD VALUE 'HOUSING';
ALTER TYPE "TransactionCategory" ADD VALUE 'BUSINESS';
ALTER TYPE "TransactionCategory" ADD VALUE 'FREELANCE';
ALTER TYPE "TransactionCategory" ADD VALUE 'INVESTMENTS';
ALTER TYPE "TransactionCategory" ADD VALUE 'TRAVEL';
ALTER TYPE "TransactionCategory" ADD VALUE 'GIFTS';
ALTER TYPE "TransactionCategory" ADD VALUE 'TECHNOLOGY';
ALTER TYPE "TransactionCategory" ADD VALUE 'LIFESTYLE';
ALTER TYPE "TransactionCategory" ADD VALUE 'CLOTHING';
ALTER TYPE "TransactionCategory" ADD VALUE 'CASH';
ALTER TYPE "TransactionCategory" ADD VALUE 'SAVINGS';
