# 数据库设计 - 快速参考

完整的数据库表结构已设计完成，包括 13 个核心表，支持完整的电商流程。

---

## 文件清单

| 文件 | 说明 |
|------|------|
| `DATABASE_SCHEMA_DESIGN.md` | 完整的数据库设计文档（4000+ 行） |
| `nestapi/src/database/schema.sql` | 可直接运行的 SQL 建表脚本 |
| `nestapi/src/entities/product.entity.ts` | TypeORM 实体定义（生成 ORM 模型） |

---

## 快速开始

### 1. 创建数据库

```bash
# 登录 MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE ruizhu_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 使用数据库
USE ruizhu_ecommerce;
```

### 2. 导入表结构

```bash
# 方式一：直接导入 SQL 文件
mysql -u root -p ruizhu_ecommerce < nestapi/src/database/schema.sql

# 方式二：在 MySQL 中执行
mysql> SOURCE nestapi/src/database/schema.sql;
```

### 3. 验证表创建成功

```sql
-- 查看所有表
SHOW TABLES;

-- 输出应该显示 13 个表：
-- categories, products, product_prices, product_images, product_stats,
-- product_attributes, product_details, product_reviews, product_tags,
-- cart_items, orders, order_items, order_refunds
```

### 4. 在 NestJS 中配置数据库连接

```typescript
// nestapi/src/ormconfig.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as entities from './entities';

export const typeormConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ruizhu_ecommerce',
  entities: [Object.values(entities)],
  synchronize: false, // 不自动同步，使用 migration
  logging: process.env.NODE_ENV === 'development',
};
```

---

## 表结构总览

### 核心表关系

```
┌─ 分类 (categories)
│
└─ 商品 (products)
   ├─ 价格 (product_prices)
   ├─ 图片 (product_images)
   ├─ 统计 (product_stats)
   ├─ 属性 (product_attributes)
   ├─ 详情 (product_details)
   ├─ 评价 (product_reviews)
   └─ 标签 (product_tags)

购物车 (cart_items) ──→ 商品

订单 (orders)
└─ 订单项 (order_items)
   └─ 退款 (order_refunds)
```

### 13 个表及其用途

| # | 表名 | 用途 | 行数预估 |
|---|------|------|---------|
| 1 | categories | 商品分类 | < 100 |
| 2 | products | 商品主表 | 几千 - 几万 |
| 3 | product_prices | 商品价格 | 与 products 相同 |
| 4 | product_images | 商品图片 | × 5-10（多对一） |
| 5 | product_stats | 商品统计 | 与 products 相同 |
| 6 | product_attributes | 商品属性 | × 5-10（颜色、尺码等） |
| 7 | product_details | 商品详情 | 与 products 相同 |
| 8 | product_reviews | 商品评价 | × 5-50（用户评价） |
| 9 | product_tags | 商品标签 | × 2-5（new, hot 等） |
| 10 | cart_items | 购物车 | 几千 |
| 11 | orders | 订单 | 几千 - 几万 |
| 12 | order_items | 订单商品 | × 3-5（每个订单） |
| 13 | order_refunds | 退款记录 | 较少（可选） |

---

## 常用查询模式

### 1. 获取商品列表（分类页面）

```sql
SELECT p.id, p.name, p.sku,
  pp.original_price, pp.current_price,
  pi.image_url,
  ps.sales_count, ps.average_rating
FROM products p
LEFT JOIN product_prices pp ON p.id = pp.product_id
LEFT JOIN product_images pi ON p.id = pi.product_id
  AND pi.image_type = 'cover'
LEFT JOIN product_stats ps ON p.id = ps.product_id
WHERE p.category_id = ?
  AND p.is_sale_on = 1
ORDER BY ps.sales_count DESC
LIMIT 20;
```

### 2. 获取商品详情

```sql
SELECT p.*,
  pp.*,
  GROUP_CONCAT(pi.image_url) as images,
  ps.*,
  pd.*,
  GROUP_CONCAT(DISTINCT pt.tag_name) as tags
FROM products p
LEFT JOIN product_prices pp ON p.id = pp.product_id
LEFT JOIN product_images pi ON p.id = pi.product_id
LEFT JOIN product_stats ps ON p.id = ps.product_id
LEFT JOIN product_details pd ON p.id = pd.product_id
LEFT JOIN product_tags pt ON p.id = pt.product_id
WHERE p.id = ?
GROUP BY p.id;
```

### 3. 获取购物车商品

```sql
SELECT ci.id, ci.quantity, ci.selected_attributes,
  p.name, p.sku,
  pp.current_price,
  pi.image_url,
  ps.stock_quantity
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
LEFT JOIN product_prices pp ON p.id = pp.product_id
LEFT JOIN product_images pi ON p.id = pi.product_id
  AND pi.image_type = 'thumb'
LEFT JOIN product_stats ps ON p.id = ps.product_id
WHERE ci.user_id = ?;
```

### 4. 创建订单

```sql
-- 第一步：插入订单
INSERT INTO orders (order_no, user_id, subtotal, shipping_cost, total_amount, status)
VALUES (?, ?, ?, ?, ?, 'pending');

-- 第二步：插入订单项（批量）
INSERT INTO order_items (order_id, product_id, quantity, product_name, sku, price_snapshot, subtotal)
VALUES (?, ?, ?, ?, ?, ?, ?);

-- 第三步：更新商品统计
UPDATE product_stats SET sales_count = sales_count + ? WHERE product_id = ?;
```

### 5. 搜索商品（全文搜索）

```sql
SELECT p.id, p.name, p.sku,
  MATCH(p.name, p.description) AGAINST(? IN BOOLEAN MODE) as relevance,
  pp.current_price
FROM products p
LEFT JOIN product_prices pp ON p.id = pp.product_id
WHERE MATCH(p.name, p.description) AGAINST(? IN BOOLEAN MODE)
  AND p.is_sale_on = 1
ORDER BY relevance DESC
LIMIT 20;
```

---

## 索引策略

### 查询优化索引

| 场景 | 索引 | 加速效果 |
|------|------|---------|
| 分类列表 | `idx_category_sale_status` | ⚡⚡⚡ |
| 热销排序 | `idx_sales_desc` | ⚡⚡⚡ |
| 价格排序 | `idx_current_price` | ⚡⚡⚡ |
| 评分排序 | `idx_rating_reviews` | ⚡⚡ |
| 新品标签 | `idx_new_created` | ⚡ |
| 用户订单 | `idx_user_orders` | ⚡⚡⚡ |
| 全文搜索 | `ft_name_desc` | ⚡⚡⚡ |

---

## 数据类型说明

### 价格存储（重要！）

所有价格都以 **分** 为单位存储（元 × 100）

```javascript
// 例子
// 数据库存储: 12800
// 显示给用户: 128.00 元

// 转换函数
function formatPrice(price: number): string {
  return (price / 100).toFixed(2);
}
```

### JSON 字段

某些字段使用 JSON 类型以支持灵活数据结构

```sql
-- 例子：购物车选中属性
UPDATE cart_items SET selected_attributes = '{"color": "红色", "size": "M"}'
WHERE id = 1;

-- 查询
SELECT JSON_EXTRACT(selected_attributes, '$.color') FROM cart_items;
```

---

## 性能建议

### 1. 索引优化

```sql
-- 创建必要的复合索引
CREATE INDEX idx_product_listing ON products(
  category_id, is_sale_on, is_out_of_stock, created_at DESC
);

-- 定期检查慢查询
SHOW SLOW LOG;
```

### 2. 缓存策略

```typescript
// 缓存不经常变化的数据
// 例如：分类、商品基础信息、价格（每小时更新）

@Injectable()
export class ProductService {
  constructor(private cacheManager: CacheManager) {}

  async getProduct(id: number) {
    // 尝试从缓存获取
    const cached = await this.cacheManager.get(`product:${id}`);
    if (cached) return cached;

    // 从数据库获取
    const product = await this.productRepository.findOne(id);

    // 缓存 1 小时
    await this.cacheManager.set(`product:${id}`, product, 3600);

    return product;
  }
}
```

### 3. 分页查询

```sql
-- ❌ 不推荐：OFFSET 效率低
SELECT * FROM products LIMIT 10000, 20;

-- ✅ 推荐：基于 ID 范围
SELECT * FROM products WHERE id > 10000 LIMIT 20;
```

### 4. 统计数据更新

```sql
-- 定期更新统计数据（每小时/每天）
UPDATE product_stats ps
SET ps.sales_count = (
  SELECT COUNT(*) FROM order_items
  WHERE product_id = ps.product_id
)
WHERE ps.id > 0;
```

---

## 扩展建议

### 短期（1 个月）

- [ ] 完成基础表结构
- [ ] 创建 TypeORM 实体
- [ ] 实现基础 CRUD 接口
- [ ] 编写单元测试

### 中期（3 个月）

- [ ] 添加缓存层（Redis）
- [ ] 实现搜索优化（Elasticsearch）
- [ ] 添加数据审计表（谁、什么、何时修改）
- [ ] 性能优化和监控

### 长期（6 个月+）

- [ ] 数据分片（按商品 ID 分片）
- [ ] 读写分离（主从复制）
- [ ] 异步消息队列（订单处理）
- [ ] 数据仓库（BI 分析）

---

## 故障排查

### 问题 1：查询超时

```sql
-- 检查索引
SHOW INDEX FROM products;

-- 分析查询
EXPLAIN SELECT ...;

-- 如果 Using filesort 或 Using temporary，需要创建索引
```

### 问题 2：磁盘空间不足

```sql
-- 查看表大小
SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'ruizhu_ecommerce'
ORDER BY size_mb DESC;

-- 清理历史数据
DELETE FROM order_refunds WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

### 问题 3：并发冲突

```sql
-- 使用行级锁防止并发问题
SELECT * FROM products WHERE id = 1 FOR UPDATE;
-- 执行更新
UPDATE products SET stock_quantity = stock_quantity - 1 WHERE id = 1;
```

---

## 下一步行动

### 立即执行（今天）

1. ✅ 创建数据库（5 分钟）
2. ✅ 导入 SQL 脚本（5 分钟）
3. ✅ 验证表结构（5 分钟）

### 本周完成

1. 配置 TypeORM（1 小时）
2. 创建服务层（2-3 小时）
3. 实现 API 端点（4-5 小时）
4. 编写集成测试（2-3 小时）

### 下周完成

1. 前端小程序集成（3-4 天）
2. 性能测试和优化（2 天）
3. 部署和上线（1-2 天）

---

## 相关文档

- 📄 **完整设计文档**: `DATABASE_SCHEMA_DESIGN.md` (本文档的详细版本)
- 🔧 **SQL 脚本**: `nestapi/src/database/schema.sql` (可直接运行)
- 🎯 **TypeORM 实体**: `nestapi/src/entities/product.entity.ts` (ORM 模型定义)
- 📊 **产品数据模型**: `PRODUCT_DATA_MODEL.md` (应用层数据结构)
- 🏗️ **架构对比**: `PRODUCT_STRUCTURE_COMPARISON.md` (改进前后对比)

---

**数据库设计完毕！可以开始后端开发了。** 🚀
