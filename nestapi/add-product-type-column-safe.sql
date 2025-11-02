-- 安全地添加 product_type 列到 products 表
-- 执行时间: 2025-11-02

-- 第1步：检查列是否已存在，如果不存在则添加
ALTER TABLE `products`
ADD COLUMN `product_type` VARCHAR(50) NOT NULL DEFAULT 'standard' COMMENT '产品类型: standard(标准产品) 或 custom(私人定制产品)';

-- 第2步：创建索引（确保列存在后创建）
ALTER TABLE `products`
ADD INDEX `idx_products_product_type` (`product_type`);

-- 第3步：验证列已成功添加
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, IS_NULLABLE, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'products' AND COLUMN_NAME = 'product_type';

-- 第4步：显示 products 表结构
SHOW COLUMNS FROM `products`;
