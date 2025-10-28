-- Migration: AddCoverImageFieldsToProducts
-- Description: Add cover_image_url and cover_image_id fields to products table for caching cover image
-- Date: 2025-10-28
-- Applied: Yes

-- Add cover image cache fields to products table
ALTER TABLE products
ADD COLUMN cover_image_url varchar(500) NULL COMMENT 'cover image url cache',
ADD COLUMN cover_image_id int NULL COMMENT 'cover image id';

-- Add index for cover_image_id to improve query performance
ALTER TABLE products
ADD INDEX idx_cover_image_id (cover_image_id);

-- Rollback SQL (if needed):
-- ALTER TABLE products DROP COLUMN cover_image_url;
-- ALTER TABLE products DROP COLUMN cover_image_id;
-- ALTER TABLE products DROP INDEX idx_cover_image_id;
