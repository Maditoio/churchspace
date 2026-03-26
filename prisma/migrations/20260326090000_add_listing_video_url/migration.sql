-- Add optional YouTube video URL to listing records
ALTER TABLE "Listing"
ADD COLUMN "videoUrl" TEXT;
