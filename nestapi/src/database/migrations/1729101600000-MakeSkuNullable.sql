-- Make sku field nullable and remove unique constraint
-- 将 sku 字段改为可空，并移除唯一约束

ALTER TABLE products
DROP INDEX sku,
MODIFY COLUMN sku varchar(100) NULL;

-- 添加索引（非唯一）以便查询
ALTER TABLE products
ADD INDEX idx_sku (sku);
