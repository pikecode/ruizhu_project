-- 添加 product_type 列到 products 表
-- 执行时间: 2025-11-02

-- 检查列是否已存在，如果不存在则添加
ALTER TABLE `products`
ADD COLUMN `product_type` VARCHAR(50) NOT NULL DEFAULT 'standard' COMMENT '产品类型: standard(标准产品) 或 custom(私人定制产品)' AFTER `stock_quantity`;

-- 创建索引以提高查询性能
ALTER TABLE `products`
ADD INDEX `idx_products_product_type` (`product_type`);

-- 验证列已成功添加
DESC `products`;

-- 查询已添加的列
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'products' AND COLUMN_NAME = 'product_type';
