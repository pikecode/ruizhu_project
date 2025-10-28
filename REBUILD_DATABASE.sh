#!/bin/bash

# ============================================
# 腾讯云 MySQL 数据库清空重建脚本
# ============================================
# 功能: 清空 mydb 数据库中的所有表，然后按我的设计重新创建
# 时间: 预计 5-10 分钟

set -e

echo "=========================================="
echo "腾讯云 MySQL 数据库清空重建工具"
echo "=========================================="
echo ""
echo "⚠️  警告: 此脚本将删除 mydb 数据库中的所有表!"
echo "⚠️  所有数据将被永久删除!"
echo ""
read -p "确认继续? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "已取消"
    exit 0
fi

# 数据库连接信息
DB_HOST="gz-cdb-qtjza6az.sql.tencentcdb.com"
DB_PORT="27226"
DB_USER="root"
DB_PASSWORD="Pp123456"
DB_NAME="mydb"

echo ""
echo "步骤 1: 连接数据库..."
echo "主机: $DB_HOST:$DB_PORT"
echo "数据库: $DB_NAME"
echo ""

# 步骤 1: 删除所有表
echo "步骤 2: 删除所有现有表..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << 'EOF'
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS
    `address`, `addresses`, `cart`, `cart_item`, `cart_items`, `carts`,
    `categories`, `category`, `collection`, `collection_products`, `collections`,
    `coupon`, `coupons`, `file`, `files`, `login_logs`,
    `order`, `order_item`, `order_items`, `orders`, `payment`, `payments`,
    `permissions`, `product`, `product_image`, `product_images`,
    `product_variant`, `product_variants`, `products`,
    `refresh_tokens`, `role`, `role_permissions`, `roles`,
    `user`, `user_roles`, `users`,
    `wishlist`, `wishlist_item`, `wishlist_items`, `wishlists`,
    `product_prices`, `product_stats`, `product_attributes`, `product_details`,
    `product_reviews`, `product_tags`, `order_refunds`;

SET FOREIGN_KEY_CHECKS=1;

SELECT CONCAT('✓ 已删除所有表。当前表数: ', COUNT(*)) as 结果
FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE();
EOF

echo "✓ 已删除所有表"
echo ""

# 步骤 2: 创建新的表结构
echo "步骤 3: 创建新的表结构..."
if [ -f "nestapi/src/database/schema.sql" ]; then
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < nestapi/src/database/schema.sql
    echo "✓ 已创建表结构"
else
    echo "❌ 错误: 找不到 schema.sql 文件"
    echo "请确保在项目根目录运行此脚本"
    exit 1
fi

echo ""

# 步骤 3: 导入示例数据
echo "步骤 4: 导入示例数据..."
read -p "是否导入示例数据? (yes/no): " import_data
if [ "$import_data" = "yes" ]; then
    if [ -f "nestapi/src/database/init-data.sql" ]; then
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < nestapi/src/database/init-data.sql
        echo "✓ 已导入示例数据"
    else
        echo "❌ 错误: 找不到 init-data.sql 文件"
    fi
else
    echo "⊘ 跳过导入示例数据"
fi

echo ""

# 步骤 4: 验证
echo "步骤 5: 验证数据库结构..."
echo ""
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << 'EOF'
SELECT '=== 验证结果 ===' as '';

SELECT CONCAT('总表数: ', COUNT(*)) as 表统计
FROM information_schema.TABLES WHERE TABLE_SCHEMA='mydb';

SELECT '' as '';
SELECT '=== 所有表 ===' as '';
SELECT TABLE_NAME FROM information_schema.TABLES
WHERE TABLE_SCHEMA='mydb' ORDER BY TABLE_NAME;

SELECT '' as '';
SELECT '=== 数据行数 ===' as '';
SELECT 'categories' as 表名, COUNT(*) as 行数 FROM categories
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'product_prices', COUNT(*) FROM product_prices
UNION ALL SELECT 'product_images', COUNT(*) FROM product_images
UNION ALL SELECT 'product_stats', COUNT(*) FROM product_stats
UNION ALL SELECT 'product_attributes', COUNT(*) FROM product_attributes
UNION ALL SELECT 'product_details', COUNT(*) FROM product_details
UNION ALL SELECT 'product_reviews', COUNT(*) FROM product_reviews
UNION ALL SELECT 'product_tags', COUNT(*) FROM product_tags
UNION ALL SELECT 'cart_items', COUNT(*) FROM cart_items
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'order_refunds', COUNT(*) FROM order_refunds;

SELECT '' as '';
SELECT 'products 表的 subtitle 字段:' as '';
SELECT IF(COUNT(*) > 0, '✓ 存在', '✗ 不存在') as 结果
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA='mydb' AND TABLE_NAME='products' AND COLUMN_NAME='subtitle';

SELECT '' as '';
SELECT '✓ 数据库重建完成！' as '';
EOF

echo ""
echo "=========================================="
echo "✅ 数据库重建完成！"
echo "=========================================="
echo ""
echo "后续步骤:"
echo "1. 启动 NestAPI:"
echo "   npm run start:dev"
echo ""
echo "2. 查看启动日志，确认数据库连接成功"
echo ""
echo "3. 开始开发"
echo ""
