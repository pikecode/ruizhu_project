-- 优化产品状态字段设计
-- 将 is_out_of_stock 和 is_sold_out 合并为 stock_status

-- 第一步：添加新的 stock_status 字段
ALTER TABLE products ADD COLUMN stock_status ENUM('normal', 'outOfStock', 'soldOut') DEFAULT 'normal' AFTER is_vip_only;

-- 第二步：数据迁移 - 将旧字段的值转换到新字段
UPDATE products
SET stock_status = CASE
  WHEN is_sold_out = 1 THEN 'soldOut'
  WHEN is_out_of_stock = 1 THEN 'outOfStock'
  ELSE 'normal'
END;

-- 第三步：删除旧字段（保留历史数据，可选择注释掉先检查数据）
-- ALTER TABLE products DROP COLUMN is_out_of_stock;
-- ALTER TABLE products DROP COLUMN is_sold_out;

-- 第四步：添加索引
ALTER TABLE products ADD INDEX idx_stock_status (stock_status);

-- 验证迁移结果
-- SELECT id, name, is_out_of_stock, is_sold_out, stock_status FROM products LIMIT 10;
