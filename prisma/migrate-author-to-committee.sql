-- Run this in Supabase: SQL Editor → New query → paste → Run
-- This adds Post.committeeMemberId and removes the old Author setup.

-- 1. Add new column (nullable)
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "committeeMemberId" TEXT;

-- 2. Drop old author relation (if it exists)
ALTER TABLE "Post" DROP CONSTRAINT IF EXISTS "Post_authorId_fkey";
ALTER TABLE "Post" DROP COLUMN IF EXISTS "authorId";

-- 3. Drop Author table (if it exists)
DROP TABLE IF EXISTS "Author";

-- 4. Add foreign key for committee member
ALTER TABLE "Post" DROP CONSTRAINT IF EXISTS "Post_committeeMemberId_fkey";
ALTER TABLE "Post" ADD CONSTRAINT "Post_committeeMemberId_fkey"
  FOREIGN KEY ("committeeMemberId") REFERENCES "CommitteeMember"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
