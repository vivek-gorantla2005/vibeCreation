-- AlterTable
ALTER TABLE "CodeFragment" ADD COLUMN     "designSpec" TEXT,
ADD COLUMN     "imageURL" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "imageURL" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "imageURL" TEXT;
