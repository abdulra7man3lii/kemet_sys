-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "storageUsed" BIGINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "storageLimit" INTEGER NOT NULL DEFAULT 100;
