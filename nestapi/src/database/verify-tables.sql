-- ============================================
-- 验证数据库表结构脚本
-- ============================================
-- 用于检查 mydb 数据库中的所有表是否按照设计创建

USE mydb;

-- ============================================
-- 1. 列出所有表
-- ============================================
SHOW TABLES;

-- ============================================
-- 2. 检查每个表的详细结构
-- ============================================

-- 分类表
DESCRIBE categories;
SHOW CREATE TABLE categories\G

-- 商品表
DESCRIBE products;
SHOW CREATE TABLE products\G

-- 价格表
DESCRIBE product_prices;
SHOW CREATE TABLE product_prices\G

-- 图片表
DESCRIBE product_images;
SHOW CREATE TABLE product_images\G

-- 统计表
DESCRIBE product_stats;
SHOW CREATE TABLE product_stats\G

-- 属性表
DESCRIBE product_attributes;
SHOW CREATE TABLE product_attributes\G

-- 详情表
DESCRIBE product_details;
SHOW CREATE TABLE product_details\G

-- 评价表
DESCRIBE product_reviews;
SHOW CREATE TABLE product_reviews\G

-- 标签表
DESCRIBE product_tags;
SHOW CREATE TABLE product_tags\G

-- 购物车表
DESCRIBE cart_items;
SHOW CREATE TABLE cart_items\G

-- 订单表
DESCRIBE orders;
SHOW CREATE TABLE orders\G

-- 订单商品表
DESCRIBE order_items;
SHOW CREATE TABLE order_items\G

-- 退款表
DESCRIBE order_refunds;
SHOW CREATE TABLE order_refunds\G

-- ============================================
-- 3. 统计表数量
-- ============================================
SELECT COUNT(*) as table_count FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'mydb';

-- ============================================
-- 4. 检查索引
-- ============================================
SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'mydb' ORDER BY TABLE_NAME, INDEX_NAME;

-- ============================================
-- 5. 检查外键约束
-- ============================================
SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'mydb' AND REFERENCED_TABLE_NAME IS NOT NULL;

-- ============================================
-- 6. 检查数据
-- ============================================
SELECT 'categories' as table_name, COUNT(*) as row_count FROM categories
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'product_prices', COUNT(*) FROM product_prices
UNION ALL
SELECT 'product_images', COUNT(*) FROM product_images
UNION ALL
SELECT 'product_stats', COUNT(*) FROM product_stats
UNION ALL
SELECT 'product_attributes', COUNT(*) FROM product_attributes
UNION ALL
SELECT 'product_details', COUNT(*) FROM product_details
UNION ALL
SELECT 'product_reviews', COUNT(*) FROM product_reviews
UNION ALL
SELECT 'product_tags', COUNT(*) FROM product_tags
UNION ALL
SELECT 'cart_items', COUNT(*) FROM cart_items
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL
SELECT 'order_refunds', COUNT(*) FROM order_refunds;
