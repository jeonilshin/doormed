-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "preparingAt" TIMESTAMP(3),
ADD COLUMN     "readyAt" TIMESTAMP(3),
ADD COLUMN     "riderReceivedAt" TIMESTAMP(3);
