-- Add discount field to users table
ALTER TABLE users
ADD COLUMN `discount` DECIMAL(5, 2) DEFAULT 1.00 COMMENT 'User discount multiplier from VIP products (0.01-1.00, default 1.00 = no discount)',
ADD INDEX `idx_user_discount` (`id`, `discount`);
