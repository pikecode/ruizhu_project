-- Add discount field to products table for VIP recharge products
ALTER TABLE products
ADD COLUMN `discount` DECIMAL(5, 2) DEFAULT 1.00 COMMENT 'Discount multiplier for VIP products (0.01-1.00, only used for vip_recharge type)',
ADD INDEX `idx_discount` (`discount`);
