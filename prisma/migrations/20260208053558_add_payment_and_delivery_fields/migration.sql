-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "orderId" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "deliveryPhoto" TEXT,
ADD COLUMN     "paymentMethod" TEXT;
