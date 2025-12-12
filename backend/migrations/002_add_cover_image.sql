-- 002_add_cover_image.sql
-- Add is_cover column to listing_image to track which image is the primary/cover image

ALTER TABLE listing_image ADD COLUMN is_cover BOOLEAN NOT NULL DEFAULT FALSE;

-- Ensure only one cover per listing (this is enforced in application logic for now)
CREATE INDEX idx_listing_image_cover ON listing_image(listing_id) WHERE is_cover = TRUE;
