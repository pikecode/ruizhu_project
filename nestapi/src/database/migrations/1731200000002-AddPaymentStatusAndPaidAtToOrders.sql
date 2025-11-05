-- Add payment timestamp to orders table
-- Status field already exists and contains 'paid' value when payment is confirmed
ALTER TABLE orders
ADD COLUMN `paid_at` TIMESTAMP NULL COMMENT 'When payment was confirmed',
ADD INDEX `idx_paid_at` (`paid_at`);
