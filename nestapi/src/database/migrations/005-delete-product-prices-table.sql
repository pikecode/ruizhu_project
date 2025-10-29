/**
 * 删除 ProductPrice 表迁移
 *
 * ProductPrice 表已合并到 products 表，所有字段已迁移到 products 表：
 * - original_price
 * - current_price
 * - discount_rate
 * - currency
 * - vip_discount_rate
 */

-- 删除 product_prices 表
DROP TABLE IF EXISTS product_prices;
