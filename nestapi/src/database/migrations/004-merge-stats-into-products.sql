-- 合并统计字段到 products 表
-- 目的：简化架构，从一对一关系改为单表存储
-- 由于商品只有一条统计记录，分离没有意义

-- 1. 向 products 表添加统计字段
ALTER TABLE products ADD COLUMN sales_count INT DEFAULT 0 COMMENT '销售数';
ALTER TABLE products ADD COLUMN views_count INT DEFAULT 0 COMMENT '浏览数';
ALTER TABLE products ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0 COMMENT '平均评分';
ALTER TABLE products ADD COLUMN reviews_count INT DEFAULT 0 COMMENT '评论数';
ALTER TABLE products ADD COLUMN favorites_count INT DEFAULT 0 COMMENT '收藏数';
ALTER TABLE products ADD COLUMN conversion_rate DECIMAL(5,2) COMMENT '转化率';
ALTER TABLE products ADD COLUMN last_sold_at TIMESTAMP NULL COMMENT '最后销售时间';

-- 2. 从 product_stats 表迁移数据到 products 表
UPDATE products p
LEFT JOIN product_stats ps ON p.id = ps.product_id
SET
  p.sales_count = COALESCE(ps.sales_count, 0),
  p.views_count = COALESCE(ps.views_count, 0),
  p.average_rating = COALESCE(ps.average_rating, 0),
  p.reviews_count = COALESCE(ps.reviews_count, 0),
  p.favorites_count = COALESCE(ps.favorites_count, 0),
  p.conversion_rate = ps.conversion_rate,
  p.last_sold_at = ps.last_sold_at
WHERE ps.id IS NOT NULL;

-- 3. 删除 product_stats 表（已不需要）
DROP TABLE IF EXISTS product_stats;

-- 4. 添加索引以优化统计相关查询
ALTER TABLE products ADD INDEX idx_sales_count (sales_count);
ALTER TABLE products ADD INDEX idx_average_rating (average_rating);
ALTER TABLE products ADD INDEX idx_favorites_count (favorites_count);
