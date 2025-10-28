# 数据库表结构验证指南

验证腾讯云 MySQL 数据库 (mydb) 中所有表是否按设计正确创建。

---

## 🚀 快速验证（3 种方法）

### 方法 1：使用验证脚本（推荐）

```bash
# 执行完整的验证脚本
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -pPp123456 < nestapi/src/database/verify-tables.sql
```

这会显示：
- ✅ 所有表的列表
- ✅ 每个表的详细结构
- ✅ 索引和约束
- ✅ 每个表的行数

### 方法 2：快速检查（仅显示表列表）

```bash
# 连接到数据库
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -pPp123456 mydb

# 在 MySQL 提示符中输入
mysql> SHOW TABLES;
```

**预期输出：应该显示 13 个表**

```
+-------------------+
| Tables_in_mydb    |
+-------------------+
| cart_items        |
| categories        |
| order_items       |
| order_refunds     |
| orders            |
| product_attributes|
| product_details   |
| product_images    |
| product_prices    |
| product_reviews   |
| product_stats     |
| product_tags      |
| products          |
+-------------------+
13 rows in set (0.00 sec)
```

### 方法 3：手动逐个检查

```bash
# 连接到数据库
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -pPp123456 mydb

# 逐个检查表结构
mysql> DESCRIBE categories;
mysql> DESCRIBE products;
mysql> DESCRIBE product_prices;
# ... 以此类推
```

---

## 📋 表结构验证清单

### 1. categories (分类表)

**预期字段：**
```
id              INT PRIMARY KEY AUTO_INCREMENT
name            VARCHAR(100) NOT NULL UNIQUE
slug            VARCHAR(100) NOT NULL UNIQUE
description     VARCHAR(500)
icon_url        VARCHAR(255)
sort_order      INT DEFAULT 0
is_active       TINYINT(1) DEFAULT 1
parent_id       INT (可空，外键)
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

**验证命令：**
```sql
DESCRIBE categories;
```

### 2. products (商品表)

**预期字段：**
```
id              INT PRIMARY KEY AUTO_INCREMENT
name            VARCHAR(200) NOT NULL
subtitle        VARCHAR(200)
sku             VARCHAR(100) NOT NULL UNIQUE
description     TEXT
category_id     INT NOT NULL (外键)
is_new          TINYINT(1) DEFAULT 0
is_sale_on      TINYINT(1) DEFAULT 1
is_out_of_stock TINYINT(1) DEFAULT 0
is_sold_out     TINYINT(1) DEFAULT 0
is_vip_only     TINYINT(1) DEFAULT 0
stock_quantity  INT DEFAULT 0
low_stock_threshold INT DEFAULT 10
weight          INT
shipping_template_id INT
free_shipping_threshold DECIMAL(10,2)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**验证命令：**
```sql
DESCRIBE products;
```

### 3. product_prices (价格表)

**预期字段：**
```
id              INT PRIMARY KEY AUTO_INCREMENT
product_id      INT NOT NULL UNIQUE (外键)
original_price  INT NOT NULL
current_price   INT NOT NULL
discount_rate   TINYINT DEFAULT 100
currency        CHAR(3) DEFAULT 'CNY'
vip_discount_rate TINYINT
price_updated_at TIMESTAMP
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**验证命令：**
```sql
DESCRIBE product_prices;
```

### 4. product_images (图片表)

**预期字段：**
```
id              INT PRIMARY KEY AUTO_INCREMENT
product_id      INT NOT NULL (外键)
image_url       VARCHAR(500) NOT NULL
image_type      ENUM('thumb','cover','list','detail') DEFAULT 'cover'
alt_text        VARCHAR(200)
sort_order      INT DEFAULT 0
width           INT
height          INT
file_size       INT
created_at      TIMESTAMP
```

**验证命令：**
```sql
DESCRIBE product_images;
```

### 5. product_stats (统计表)

**预期字段：**
```
id              INT PRIMARY KEY AUTO_INCREMENT
product_id      INT NOT NULL UNIQUE (外键)
sales_count     INT DEFAULT 0
views_count     INT DEFAULT 0
average_rating  DECIMAL(3,2) DEFAULT 0
reviews_count   INT DEFAULT 0
favorites_count INT DEFAULT 0
conversion_rate DECIMAL(5,2)
last_sold_at    TIMESTAMP
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**验证命令：**
```sql
DESCRIBE product_stats;
```

### 6. product_attributes (属性表)

**预期字段：**
```
id              INT PRIMARY KEY AUTO_INCREMENT
product_id      INT NOT NULL (外键)
attribute_name  VARCHAR(50) NOT NULL
attribute_value VARCHAR(200) NOT NULL
attribute_sku_suffix VARCHAR(50)
additional_price INT DEFAULT 0
stock_quantity  INT DEFAULT 0
color_hex       VARCHAR(7)
size_sort_order INT
created_at      TIMESTAMP
```

**验证命令：**
```sql
DESCRIBE product_attributes;
```

### 7. product_details (详情表)

**预期字段：**
```
id              INT PRIMARY KEY AUTO_INCREMENT
product_id      INT NOT NULL UNIQUE (外键)
brand           VARCHAR(100)
material        VARCHAR(200)
origin          VARCHAR(100)
weight_value    DECIMAL(8,2)
length          DECIMAL(8,2)
width           DECIMAL(8,2)
height          DECIMAL(8,2)
full_description LONGTEXT
highlights      LONGTEXT
care_guide      TEXT
warranty        TEXT
seo_keywords    VARCHAR(500)
seo_description VARCHAR(500)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**验证命令：**
```sql
DESCRIBE product_details;
```

### 8. product_reviews (评价表)

**预期字段：**
```
id              INT PRIMARY KEY AUTO_INCREMENT
product_id      INT NOT NULL (外键)
user_id         INT NOT NULL
order_item_id   INT (外键)
rating          TINYINT NOT NULL
comment         TEXT
review_images   LONGTEXT
helpful_count   INT DEFAULT 0
unhelpful_count INT DEFAULT 0
is_verified_purchase TINYINT(1) DEFAULT 1
is_approved     TINYINT(1) DEFAULT 1
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**验证命令：**
```sql
DESCRIBE product_reviews;
```

### 9. product_tags (标签表)

**预期字段：**
```
id              INT PRIMARY KEY AUTO_INCREMENT
product_id      INT NOT NULL (外键)
tag_name        VARCHAR(50) NOT NULL
created_at      TIMESTAMP
```

**验证命令：**
```sql
DESCRIBE product_tags;
```

### 10. cart_items (购物车表)

**预期字段：**
```
id              INT PRIMARY KEY AUTO_INCREMENT
user_id         INT NOT NULL
product_id      INT NOT NULL (外键)
quantity        INT NOT NULL DEFAULT 1
selected_attributes JSON
selected_color_id VARCHAR(100)
selected_size_id VARCHAR(100)
cart_price      INT
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**验证命令：**
```sql
DESCRIBE cart_items;
```

### 11. orders (订单表)

**预期字段：**
```
id              INT PRIMARY KEY AUTO_INCREMENT
order_no        VARCHAR(100) NOT NULL UNIQUE
user_id         INT NOT NULL
subtotal        INT NOT NULL
shipping_cost   INT DEFAULT 0
discount_amount INT DEFAULT 0
total_amount    INT NOT NULL
status          ENUM('pending','paid','processing','shipped','delivered','completed','cancelled','refunded')
payment_status  ENUM('unpaid','paid','refunded') DEFAULT 'unpaid'
shipping_address TEXT
receiver_name   VARCHAR(100)
receiver_phone  VARCHAR(20)
notes           TEXT
paid_at         TIMESTAMP NULL
shipped_at      TIMESTAMP NULL
delivered_at    TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**验证命令：**
```sql
DESCRIBE orders;
```

### 12. order_items (订单商品表)

**预期字段：**
```
id              INT PRIMARY KEY AUTO_INCREMENT
order_id        INT NOT NULL (外键)
product_id      INT NOT NULL (外键)
quantity        INT NOT NULL
selected_attributes JSON
product_name    VARCHAR(200) NOT NULL
sku             VARCHAR(100)
price_snapshot  INT NOT NULL
subtotal        INT NOT NULL
status          ENUM('pending','shipped','delivered','returned','refunded')
refundable      TINYINT(1) DEFAULT 1
refund_reason   TEXT
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**验证命令：**
```sql
DESCRIBE order_items;
```

### 13. order_refunds (退款表)

**预期字段：**
```
id              INT PRIMARY KEY AUTO_INCREMENT
refund_no       VARCHAR(100) NOT NULL UNIQUE
order_item_id   INT NOT NULL (外键)
refund_amount   INT NOT NULL
status          ENUM('pending','approved','processing','completed','rejected')
refund_reason   VARCHAR(500)
refund_description TEXT
return_tracking_no VARCHAR(100)
return_received_at TIMESTAMP NULL
processed_by    INT
processed_notes TEXT
processed_at    TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

**验证命令：**
```sql
DESCRIBE order_refunds;
```

---

## ✅ 完整验证步骤

### 步骤 1：验证表数量

```bash
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -pPp123456 mydb -e "SELECT COUNT(*) as table_count FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'mydb';"
```

**预期结果：** `13`

### 步骤 2：列出所有表

```bash
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -pPp123456 mydb -e "SHOW TABLES;"
```

**预期结果：** 13 个表的列表

### 步骤 3：验证关键表结构

```bash
# 验证 products 表（最重要）
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -pPp123456 mydb -e "DESCRIBE products;"

# 验证是否有 subtitle 字段
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -pPp123456 mydb -e "SHOW COLUMNS FROM products WHERE Field='subtitle';"
```

**预期结果：** subtitle 字段存在，类型为 VARCHAR(200)

### 步骤 4：验证索引

```bash
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -pPp123456 mydb -e "SHOW INDEX FROM products;"
```

**预期结果：** 应该有多个索引

### 步骤 5：验证外键约束

```bash
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -pPp123456 mydb -e "SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA='mydb' AND REFERENCED_TABLE_NAME IS NOT NULL;"
```

**预期结果：** 显示多个外键约束

### 步骤 6：验证数据（如果导入了 init-data）

```bash
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -pPp123456 mydb -e "SELECT 'categories' as table_name, COUNT(*) as count FROM categories UNION ALL SELECT 'products', COUNT(*) FROM products UNION ALL SELECT 'product_prices', COUNT(*) FROM product_prices UNION ALL SELECT 'product_images', COUNT(*) FROM product_images;"
```

**预期结果（如果有初始化数据）：**
```
categories: 4
products: 12
product_prices: 12
product_images: 39+
```

---

## ⚠️ 常见问题修复

### 问题 1：表已存在警告

```
Table 'categories' already exists
```

**原因：** 表已经存在，脚本再次执行

**解决方案：**
```bash
# 删除所有表（如果需要重新创建）
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -pPp123456 mydb << EOF
DROP TABLE IF EXISTS order_refunds;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS product_tags;
DROP TABLE IF EXISTS product_reviews;
DROP TABLE IF EXISTS product_details;
DROP TABLE IF EXISTS product_attributes;
DROP TABLE IF EXISTS product_stats;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS product_prices;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
EOF

# 然后重新执行建表脚本
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -pPp123456 mydb < nestapi/src/database/schema.sql
```

### 问题 2：Integer display width 警告

```
Integer display width is deprecated and will be removed in a future release
```

**原因：** MySQL 8.0.17+ 不推荐在 INT 后面写显示宽度（如 INT(11)）

**影响：** 仅是警告，不影响功能

**解决方案：** 可以忽略此警告，或修改脚本移除显示宽度

```bash
# 查看当前的字段定义
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -pPp123456 mydb -e "SHOW CREATE TABLE products\G"
```

---

## 🎯 核心字段验证

最重要的几个字段必须存在：

```bash
# 检查 products 表中最关键的字段
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -pPp123456 mydb << EOF
SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_KEY,
    COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA='mydb' AND TABLE_NAME='products'
ORDER BY ORDINAL_POSITION;
EOF
```

**关键字段清单：**
- [ ] id (INT PRIMARY KEY AUTO_INCREMENT)
- [ ] name (VARCHAR(200) NOT NULL)
- [ ] subtitle (VARCHAR(200) - 新增字段)
- [ ] sku (VARCHAR(100) NOT NULL UNIQUE)
- [ ] category_id (INT NOT NULL)
- [ ] stock_quantity (INT)
- [ ] is_new, is_sale_on, is_out_of_stock 等状态字段

---

## 📊 最终检查清单

运行下面的脚本获得完整的验证报告：

```bash
mysql -h gz-cdb-qtjza6az.sql.tencentcdb.com -P 27226 -u root -pPp123456 mydb << EOF

-- 1. 表数量
SELECT '=== 表统计 ===' as info;
SELECT COUNT(*) as total_tables FROM information_schema.TABLES WHERE TABLE_SCHEMA='mydb';

-- 2. 所有表名
SELECT '=== 所有表名 ===' as info;
SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA='mydb' ORDER BY TABLE_NAME;

-- 3. products 表字段
SELECT '=== products 表字段 ===' as info;
SELECT COLUMN_NAME, COLUMN_TYPE FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA='mydb' AND TABLE_NAME='products' ORDER BY ORDINAL_POSITION;

-- 4. products 表索引
SELECT '=== products 表索引 ===' as info;
SHOW INDEX FROM products;

-- 5. 数据行数
SELECT '=== 数据统计 ===' as info;
SELECT 'categories' as name, COUNT(*) as count FROM categories
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'product_prices', COUNT(*) FROM product_prices
UNION ALL SELECT 'product_images', COUNT(*) FROM product_images;

EOF
```

---

## 🎉 验证完成

如果所有验证都通过，那么：
✅ 13 个表都已创建
✅ 所有字段结构正确
✅ 索引和约束已建立
✅ 数据库设计完成

现在可以启动 NestAPI 开始开发了！

```bash
npm run start:dev
```

---

*最后更新: 2024-10-28*
