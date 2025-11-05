-- 合并价格字段到 products 表
-- 目的：简化架构，从一对一关系改为单表存储
-- 由于商品只有一条价格记录，分离没有意义

-- 1. 向 products 表添加价格字段
ALTER TABLE products ADD COLUMN original_price INT COMMENT '原价（分为单位）';
ALTER TABLE products ADD COLUMN current_price INT COMMENT '现价（分为单位）';
ALTER TABLE products ADD COLUMN discount_rate TINYINT DEFAULT 100 COMMENT '折扣率 0-100';
ALTER TABLE products ADD COLUMN currency CHAR(3) DEFAULT 'CNY' COMMENT '货币代码';
ALTER TABLE products ADD COLUMN vip_discount_rate TINYINT COMMENT 'VIP折扣率 0-100';

-- 2. 从 product_prices 表迁移数据到 products 表
UPDATE products p
LEFT JOIN product_prices pp ON p.id = pp.product_id
SET
  p.original_price = pp.original_price,
  p.current_price = pp.current_price,
  p.discount_rate = COALESCE(pp.discount_rate, 100),
  p.currency = COALESCE(pp.currency, 'CNY'),
  p.vip_discount_rate = pp.vip_discount_rate
WHERE pp.id IS NOT NULL;

-- 3. 删除 product_prices 表（已不需要）
DROP TABLE IF EXISTS product_prices;

-- 4. 添加索引以优化价格相关查询
ALTER TABLE products ADD INDEX idx_current_price (current_price);
