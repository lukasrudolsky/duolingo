-- CreateTable
CREATE TABLE "LessonItem" (
    "lessonId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "LessonItem_pkey" PRIMARY KEY ("lessonId","itemId")
);

-- CreateIndex
CREATE INDEX "LessonItem_itemId_idx" ON "LessonItem"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonItem_lessonId_order_key" ON "LessonItem"("lessonId", "order");

-- AddForeignKey
ALTER TABLE "LessonItem" ADD CONSTRAINT "LessonItem_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonItem" ADD CONSTRAINT "LessonItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
