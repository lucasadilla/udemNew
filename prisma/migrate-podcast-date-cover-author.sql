-- Run in Supabase SQL Editor if you already have PodcastEpisode table.
-- Adds date, cover image, and author (committee member) to podcast episodes.

ALTER TABLE "PodcastEpisode" ADD COLUMN IF NOT EXISTS "coverImageUrl" TEXT;
ALTER TABLE "PodcastEpisode" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
ALTER TABLE "PodcastEpisode" ADD COLUMN IF NOT EXISTS "committeeMemberId" TEXT;

ALTER TABLE "PodcastEpisode" DROP CONSTRAINT IF EXISTS "PodcastEpisode_committeeMemberId_fkey";
ALTER TABLE "PodcastEpisode" ADD CONSTRAINT "PodcastEpisode_committeeMemberId_fkey"
  FOREIGN KEY ("committeeMemberId") REFERENCES "CommitteeMember"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
