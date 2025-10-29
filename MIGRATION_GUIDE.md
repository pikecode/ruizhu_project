# 数据库迁移指南

## ProductStats 表合并迁移

### 概述

本迁移将 `ProductStats` 表合并到 `products` 表，以简化数据库架构。

**原因**: `ProductStats` 与 `Product` 是一对一关系（带 UNIQUE 约束），没有必要分离。

### 迁移内容

#### 添加到 products 表的字段
```sql
- sales_count (INT, default 0)          -- 销售数
- views_count (INT, default 0)          -- 浏览数
- average_rating (DECIMAL(3,2), default 0) -- 平均评分
- reviews_count (INT, default 0)        -- 评论数
- favorites_count (INT, default 0)      -- 收藏数
- conversion_rate (DECIMAL(5,2))        -- 转化率
- last_sold_at (TIMESTAMP NULL)         -- 最后销售时间
```

#### 删除的表
```sql
- product_stats
```

#### 添加的索引
```sql
- idx_sales_count (sales_count)
- idx_average_rating (average_rating)
- idx_favorites_count (favorites_count)
```

### 迁移步骤

#### 方式 1: 使用迁移脚本（推荐）

```bash
# 设置数据库环境变量
export DB_HOST=<你的数据库主机>
export DB_PORT=3306
export DB_USER=<数据库用户名>
export DB_PASSWORD=<数据库密码>
export DB_NAME=<数据库名>

# 执行迁移脚本
bash nestapi/scripts/run-migration.sh
```

#### 方式 2: 手动执行 SQL

```bash
mysql -h <主机> -P <端口> -u <用户名> -p<密码> <数据库名> < nestapi/src/database/migrations/004-merge-stats-into-products.sql
```

#### 方式 3: 在 MySQL 客户端中执行

1. 连接到数据库
```bash
mysql -h <主机> -P <端口> -u <用户名> -p
```

2. 选择数据库
```sql
USE <数据库名>;
```

3. 执行迁移脚本中的 SQL

### 验证迁移

迁移完成后，验证以下内容：

```sql
-- 1. 检查 products 表新增字段
DESCRIBE products;
-- 应该看到: sales_count, views_count, average_rating, reviews_count, favorites_count, conversion_rate, last_sold_at

-- 2. 检查 product_stats 表是否已删除
SHOW TABLES LIKE 'product_stats';
-- 应该返回空结果

-- 3. 检查索引
SHOW INDEXES FROM products WHERE Key_name IN ('idx_sales_count', 'idx_average_rating', 'idx_favorites_count');
-- 应该看到 3 个新索引
```

### 代码更改

迁移对应的代码更改已在以下文件中实施：

#### Backend (NestJS)
- `nestapi/src/entities/product.entity.ts`
  - Product 实体：添加 7 个统计字段
  - 移除 ProductStats 关系

- `nestapi/src/modules/products/products.service.ts`
  - 移除 ProductStats 仓储注入
  - 更新所有查询方法移除 stats JOIN
  - 更新数据转换逻辑

- `nestapi/src/modules/products/products.module.ts`
  - 移除 ProductStats 导入和注册

- `nestapi/src/database/database.config.ts`
  - 移除 ProductStats 导入和配置

### 影响分析

#### 性能改进
- ✅ 消除不必要的 JOIN 操作
- ✅ 所有产品查询（列表、搜索、热销等）性能提升
- ✅ 减少数据库连接数

#### API 兼容性
- ✅ API 响应格式不变
- ✅ DTO 结构保持一致
- ✅ 无需修改客户端代码

#### 数据库安全
- ✅ 级联删除仍然有效
- ✅ 数据完整性得到保障
- ✅ 外键关系简化

### 回滚方案

如果需要回滚此迁移，可以执行反向迁移脚本（需另外创建）。

### 常见问题

**Q: 迁移需要多长时间？**
A: 取决于数据库大小，通常几秒到几分钟。

**Q: 迁移期间应用可以继续运行吗？**
A: 建议在维护窗口执行，但理论上可以继续运行（会有短暂的表锁定）。

**Q: 数据会丢失吗？**
A: 不会，所有数据都会迁移到 products 表。

**Q: 是否需要更新应用代码？**
A: 已经更新了所有应用代码，无需修改其他文件。

---

迁移完成后，应用会自动使用合并后的表结构。
