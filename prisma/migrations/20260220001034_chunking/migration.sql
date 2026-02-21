-- CreateTable
CREATE TABLE "CodeChunk" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "embedding" vector(768) NOT NULL,
    "code" TEXT NOT NULL,
    "metadata" JSONB,
    "chunkIndex" INTEGER NOT NULL,
    "filePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CodeChunk_projectId_idx" ON "CodeChunk"("projectId");

-- AddForeignKey
ALTER TABLE "CodeChunk" ADD CONSTRAINT "CodeChunk_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
