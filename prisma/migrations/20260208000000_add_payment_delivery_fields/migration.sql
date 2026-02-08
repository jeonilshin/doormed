-- AlterTable
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "deliveryPhoto" TEXT;
