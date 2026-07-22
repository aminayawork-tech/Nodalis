-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TrendDirection" AS ENUM ('rising', 'steady', 'fading');

-- CreateEnum
CREATE TYPE "SavedItemType" AS ENUM ('story', 'thread');

-- CreateTable
CREATE TABLE "Thread" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThreadEntry" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "storyId" TEXT,
    "summary" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThreadEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Theme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryTheme" (
    "storyId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,

    CONSTRAINT "StoryTheme_pkey" PRIMARY KEY ("storyId","themeId")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "whyNow" TEXT NOT NULL,
    "trend" "TrendDirection" NOT NULL DEFAULT 'steady',
    "whatHappened" TEXT NOT NULL,
    "background" TEXT NOT NULL,
    "whoInvolved" TEXT NOT NULL,
    "whatsNext" TEXT NOT NULL,
    "talkingPoints" TEXT NOT NULL,
    "origin" TEXT NOT NULL DEFAULT 'manual',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "threadId" TEXT,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedItem" (
    "id" TEXT NOT NULL,
    "type" "SavedItemType" NOT NULL,
    "storyId" TEXT,
    "threadId" TEXT,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ThreadEntry_storyId_key" ON "ThreadEntry"("storyId");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_name_key" ON "Theme"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_slug_key" ON "Theme"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Story_slug_key" ON "Story"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SavedItem_storyId_key" ON "SavedItem"("storyId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedItem_threadId_key" ON "SavedItem"("threadId");

-- AddForeignKey
ALTER TABLE "ThreadEntry" ADD CONSTRAINT "ThreadEntry_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThreadEntry" ADD CONSTRAINT "ThreadEntry_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryTheme" ADD CONSTRAINT "StoryTheme_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryTheme" ADD CONSTRAINT "StoryTheme_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedItem" ADD CONSTRAINT "SavedItem_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedItem" ADD CONSTRAINT "SavedItem_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

