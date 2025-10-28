# Collections 模块设置说明

## 概述

Collections（集合）模块用于管理小程序首页的"精品服饰"、"精品珠宝"等模块。

## 文件结构

```
nestapi/
├── src/
│   ├── entities/
│   │   ├── collection.entity.ts              # Collection 实体
│   │   └── collection-product.entity.ts      # CollectionProduct 实体
│   │
│   ├── modules/collections/
│   │   ├── collections.module.ts             # Collections 模块
│   │   ├── collections.service.ts            # Collections 服务
│   │   ├── collections.controller.ts         # Collections 控制器
│   │   └── dto/
│   │       ├── create-collection.dto.ts      # 创建集合 DTO
│   │       ├── update-collection.dto.ts      # 更新集合 DTO
│   │       ├── collection-response.dto.ts    # 响应 DTO
│   │       └── manage-products.dto.ts        # 产品管理 DTO
│   │
│   └── database/
│       └── migrations/
│           └── 1700000000000-CreateCollectionsTable.sql  # 数据库迁移
│
└── COLLECTIONS_SETUP.md                      # 本文件
```

## 数据库设置

### 方法1：手动执行 SQL（推荐）

1. 连接到你的数据库（腾讯云 CDB MySQL、阿里云 RDS、AWS RDS 等）
2. 执行以下 SQL 命令：

```sql
-- 创建 collections 表（集合/模块）
CREATE TABLE IF NOT EXISTS `collections` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT '集合名称',
  `slug` VARCHAR(100) NOT NULL UNIQUE COMMENT 'URL友好的标识',
  `description` VARCHAR(500) COMMENT '集合描述',
  `cover_image_url` VARCHAR(500) COMMENT '集合封面图片',
  `icon_url` VARCHAR(255) COMMENT '集合图标',
  `sort_order` INT DEFAULT 0 COMMENT '显示顺序',
  `is_active` TINYINT DEFAULT 1 COMMENT '是否激活',
  `is_featured` TINYINT DEFAULT 0 COMMENT '是否在首页展示',
  `remark` TEXT COMMENT '备注说明',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  INDEX `idx_is_active_sort_order` (`is_active`, `sort_order`),
  INDEX `idx_is_featured` (`is_featured`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='集合表（首页模块）';

-- 创建 collection_products 表（集合和产品的关联）
CREATE TABLE IF NOT EXISTS `collection_products` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `collection_id` INT NOT NULL COMMENT '集合ID',
  `product_id` INT NOT NULL COMMENT '产品ID',
  `sort_order` INT DEFAULT 0 COMMENT '该集合内的显示顺序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  UNIQUE KEY `uk_collection_product` (`collection_id`, `product_id`),
  INDEX `idx_collection_sort` (`collection_id`, `sort_order`),
  INDEX `idx_product_id` (`product_id`),
  FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='集合产品关联表';
```

### 方法2：初始化示例数据

执行上述 SQL 创建表后，可以插入示例数据：

```sql
-- 插入两个示例集合
INSERT INTO `collections` (name, slug, description, is_active, is_featured, sort_order) VALUES
('精品服饰', 'premium-clothing', '精选高品质服装系列', 1, 1, 1),
('精品珠宝', 'premium-jewelry', '精选高品质珠宝系列', 1, 1, 2);

-- 查看已创建的集合
SELECT * FROM collections;
```

## API 使用说明

### 基础 URL
```
http://localhost:3000/api/v1
```

### 1. 获取首页集合列表（小程序用）

**端点：** `GET /collections/home`

**参数：**
- `productsPerCollection` (可选): 每个集合显示的产品数，默认6

**响应示例：**
```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "精品服饰",
      "slug": "premium-clothing",
      "description": "精选高品质服装系列",
      "coverImageUrl": "https://...",
      "iconUrl": "https://...",
      "sortOrder": 1,
      "productCount": 25,
      "featuredProducts": [
        {
          "id": 123,
          "name": "连衣裙",
          "currentPrice": 3999,
          "originalPrice": 5999,
          "discountRate": 67,
          "coverImageUrl": "https://...",
          "isNew": true,
          "isSaleOn": true,
          "isOutOfStock": false,
          "stockQuantity": 100,
          "tags": ["新品", "热销"]
        },
        ...
      ]
    },
    {
      "id": 2,
      "name": "精品珠宝",
      ...
    }
  ]
}
```

### 2. 按 slug 获取集合详情（小程序详情页用）

**端点：** `GET /collections/:slug`

**示例：** `GET /collections/premium-clothing`

**响应示例：**
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "精品服饰",
    "slug": "premium-clothing",
    "description": "精选高品质服装系列",
    "coverImageUrl": "https://...",
    "sortOrder": 1,
    "isActive": true,
    "isFeatured": true,
    "productCount": 25,
    "products": [
      { ...产品详情... },
      { ...产品详情... },
      ...
    ],
    "createdAt": "2024-10-28T10:00:00.000Z",
    "updatedAt": "2024-10-28T10:00:00.000Z"
  }
}
```

---

## Admin 管理 API

### 3. 创建集合

**端点：** `POST /collections`

**请求体：**
```json
{
  "name": "新季上市",
  "slug": "new-season",
  "description": "最新款式上市",
  "coverImageUrl": "https://...",
  "iconUrl": "https://...",
  "sortOrder": 3,
  "isActive": true,
  "isFeatured": true,
  "remark": "2024秋冬新品"
}
```

### 4. 获取集合列表（后台管理）

**端点：** `GET /collections?page=1&limit=10`

### 5. 更新集合

**端点：** `PUT /collections/:id`

**请求体：**
```json
{
  "name": "精品服饰（更新）",
  "description": "更新的描述",
  "sortOrder": 2,
  "isFeatured": false
}
```

### 6. 删除集合

**端点：** `DELETE /collections/:id`

### 7. 获取集合详情（后台管理）

**端点：** `GET /collections/:id/detail`

---

## 集合内产品管理

### 8. 添加产品到集合

**端点：** `POST /collections/:id/products/add`

**请求体：**
```json
{
  "productIds": [1, 2, 3, 4, 5],
  "startSortOrder": 0
}
```

### 9. 从集合删除产品

**端点：** `DELETE /collections/:id/products/remove`

**请求体：**
```json
{
  "productIds": [1, 2]
}
```

### 10. 调整集合内产品顺序

**端点：** `PUT /collections/:id/products/sort`

**请求体：**
```json
{
  "products": [
    { "productId": 1, "sortOrder": 0 },
    { "productId": 2, "sortOrder": 1 },
    { "productId": 3, "sortOrder": 2 }
  ]
}
```

---

## 测试步骤

### 1. 创建集合
```bash
curl -X POST http://localhost:3000/api/v1/collections \
  -H "Content-Type: application/json" \
  -d '{
    "name": "精品服饰",
    "slug": "premium-clothing",
    "description": "精选高品质服装系列",
    "isActive": true,
    "isFeatured": true,
    "sortOrder": 1
  }'
```

### 2. 获取集合列表（后台）
```bash
curl http://localhost:3000/api/v1/collections?page=1&limit=10
```

### 3. 获取首页集合列表（小程序）
```bash
curl http://localhost:3000/api/v1/collections/home
```

### 4. 获取集合详情
```bash
curl http://localhost:3000/api/v1/collections/premium-clothing
```

### 5. 添加产品到集合
```bash
curl -X POST http://localhost:3000/api/v1/collections/1/products/add \
  -H "Content-Type: application/json" \
  -d '{
    "productIds": [1, 2, 3, 4, 5, 6]
  }'
```

### 6. 调整产品顺序
```bash
curl -X PUT http://localhost:3000/api/v1/collections/1/products/sort \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      { "productId": 1, "sortOrder": 0 },
      { "productId": 2, "sortOrder": 1 },
      { "productId": 3, "sortOrder": 2 }
    ]
  }'
```

---

## 小程序前端集成示例

### React Native / Taro 示例

```typescript
// 获取首页集合数据
async function getHomeCollections() {
  const response = await fetch('http://your-api/api/v1/collections/home');
  const result = await response.json();
  return result.data; // 返回集合列表
}

// 获取集合详情（点击集合后）
async function getCollectionDetail(slug: string) {
  const response = await fetch(`http://your-api/api/v1/collections/${slug}`);
  const result = await response.json();
  return result.data; // 返回集合详情及所有产品
}
```

---

## 常见问题

### Q: 如何给集合添加多个产品？
A: 使用 `POST /collections/:id/products/add` 端点，传入产品ID数组即可批量添加。

### Q: 一个产品可以属于多个集合吗？
A: 可以。产品和集合是多对多的关系，一个产品可以同时属于多个集合。

### Q: 如何调整集合的显示顺序？
A: 使用 `PUT /collections` 端点更新 `sortOrder` 字段即可。

### Q: 如何让集合显示在小程序首页？
A: 创建集合时设置 `isFeatured: true`，然后调用 `/collections/home` 端点获取首页集合。

### Q: 集合内的产品显示顺序如何设置？
A: 使用 `PUT /collections/:id/products/sort` 端点调整产品顺序。

---

## 性能优化建议

1. **缓存首页集合数据**：小程序可以缓存首页集合数据，避免频繁请求
2. **分页加载**：集合详情页面可以分页加载产品
3. **数据库索引**：已为 `is_featured`、`sort_order` 等字段创建索引
4. **关联查询优化**：Service 中使用 DataSource 进行优化的 SQL 查询

---

## 后续功能扩展

1. **集合统计数据**：添加集合的浏览量、销售额统计
2. **集合营销工具**：限时活动、优惠券与集合关联
3. **集合搜索**：支持按名称、描述搜索集合
4. **集合版本管理**：支持创建集合草稿、预览、发布流程

---

有任何问题，请参考 API 端点的注释说明或联系开发团队。
