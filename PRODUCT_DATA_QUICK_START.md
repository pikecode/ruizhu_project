# 商品数据 - 快速开始指南

包含服装、珠宝、鞋履、香水 4 个分类和 12 个示例商品的完整初始化数据。

---

## 🚀 一键导入数据

### 第1步：创建数据库

```bash
mysql -u root -p
```

```sql
CREATE DATABASE ruizhu_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 第2步：导入表结构

```bash
mysql -u root -p ruizhu_ecommerce < nestapi/src/database/schema.sql
```

### 第3步：导入初始化数据

```bash
mysql -u root -p ruizhu_ecommerce < nestapi/src/database/init-data.sql
```

### 第4步：验证数据

```bash
mysql -u root -p ruizhu_ecommerce
```

```sql
-- 验证分类
SELECT * FROM categories;
-- 预期: 4 条记录

-- 验证商品
SELECT id, name, subtitle, sku FROM products LIMIT 5;

-- 验证价格
SELECT p.id, p.name, pp.original_price, pp.current_price
FROM products p
LEFT JOIN product_prices pp ON p.id = pp.product_id LIMIT 5;

-- 验证图片
SELECT COUNT(*) as total_images FROM product_images;
-- 预期: 39 张图片

-- 验证统计
SELECT COUNT(*) as total_stats FROM product_stats;
-- 预期: 12 条统计记录
```

---

## 📊 数据统计

### 初始化数据包含

| 项目 | 数量 | 说明 |
|------|------|------|
| **分类** | 4 | 服装、珠宝、鞋履、香水 |
| **商品** | 12 | 每个分类3个商品 |
| **价格** | 12 | 每个商品一条价格 |
| **图片** | 39+ | 每个商品3-4张图片 |
| **属性** | 18+ | 颜色、尺码、材质等 |
| **统计** | 12 | 销量、评分、浏览等 |
| **标签** | 14+ | new、hot、limited等 |
| **详情** | 5 | 部分商品详情信息 |

---

## 🏷️ 分类一览

### 1️⃣ 服装 (Clothing)

```
服装 (clothing)
├── 黑色真丝连衣裙 (CLT-001)
│   ├── 价格: ¥1288.00 → ¥998.00 (78折)
│   ├── 库存: 45件
│   ├── 标签: 新品, 热销
│   ├── 属性: 颜色(3种), 尺码(4种)
│   └── 统计: 销量1250, 评分4.7⭐
│
├── 米白色针织衫 (CLT-002)
│   ├── 价格: ¥899.00 → ¥699.00 (78折)
│   ├── 库存: 60件
│   ├── 标签: 打折
│   └── 统计: 销量850, 评分4.5⭐
│
└── 蓝色牛仔夹克 (CLT-003)
    ├── 价格: ¥1699.00 → ¥1299.00 (76折)
    ├── 库存: 38件
    ├── 标签: 新品
    └── 统计: 销量680, 评分4.6⭐
```

### 2️⃣ 珠宝 (Jewelry)

```
珠宝 (jewelry)
├── 18K金钻石项链 (JWL-001)
│   ├── 价格: ¥5800.00 → ¥4480.00 (77折)
│   ├── 库存: 15件
│   ├── 标签: 热销, VIP专属
│   └── 统计: 销量320, 评分4.9⭐
│
├── 925银珍珠手镯 (JWL-002)
│   ├── 价格: ¥1850.00 → ¥1428.00 (77折)
│   ├── 库存: 28件
│   ├── 标签: 热销
│   └── 统计: 销量450, 评分4.8⭐
│
└── 翡翠玉石手镯 (JWL-003)
    ├── 价格: ¥3500.00 → ¥2690.00 (77折)
    ├── 库存: 12件
    ├── 标签: 限量
    └── 统计: 销量220, 评分4.8⭐
```

### 3️⃣ 鞋履 (Shoes)

```
鞋履 (shoes)
├── 黑色高跟鞋 (SHO-001)
│   ├── 价格: ¥689.00 → ¥549.00 (80折)
│   ├── 库存: 55件
│   ├── 标签: 热销
│   └── 统计: 销量1580, 评分4.6⭐
│
├── 白色运动鞋 (SHO-002)
│   ├── 价格: ¥499.00 → ¥399.00 (80折)
│   ├── 库存: 72件
│   ├── 标签: 热销
│   ├── 属性: 颜色(3种), 尺码(6种)
│   └── 统计: 销量2100, 评分4.7⭐
│
└── 棕色皮靴 (SHO-003)
    ├── 价格: ¥899.00 → ¥719.00 (80折)
    ├── 库存: 38件
    ├── 标签: 打折
    └── 统计: 销量560, 评分4.5⭐
```

### 4️⃣ 香水 (Perfume)

```
香水 (perfume)
├── 香奈儿五号香水 (PER-001)
│   ├── 价格: ¥1499.00 → ¥1199.00 (80折)
│   ├── 库存: 30件
│   ├── 标签: 热销
│   └── 统计: 销量890, 评分4.9⭐
│
├── 迪奥真我香水 (PER-002)
│   ├── 价格: ¥989.00 → ¥799.00 (81折)
│   ├── 库存: 45件
│   ├── 标签: 新品
│   └── 统计: 销量1250, 评分4.8⭐
│
└── 兰蔻魅力香水 (PER-003)
    ├── 价格: ¥1089.00 → ¥879.00 (81折)
    ├── 库存: 25件
    ├── 标签: 打折
    └── 统计: 销量680, 评分4.7⭐
```

---

## 📋 商品信息字段说明

### 基本信息

| 字段 | 示例 | 说明 |
|------|------|------|
| **大标题 (name)** | 黑色真丝连衣裙 | 商品主标题 |
| **小标题 (subtitle)** | 春夏新款·显气质 | 商品副标题 |
| **SKU** | CLT-001 | 商品编码 |
| **分类** | 服装 | 所属分类 |
| **库存** | 45 | 现有库存数 |

### 价格信息

| 字段 | 示例 | 说明 |
|------|------|------|
| **原价** | 1288.00 | 商品原价 |
| **现价** | 998.00 | 当前售价 |
| **折扣** | 78 | 折扣率（78折） |

### 图片

| 类型 | 尺寸 | 用途 |
|------|------|------|
| **thumb** | 200×200 | 列表页缩略图 |
| **cover** | 400×400 | 列表页封面 |
| **detail** | 800×800 | 详情页高清图 |

### 标签

| 标签 | 含义 | 显示 |
|------|------|------|
| **new** | 新品 | 新品标签 |
| **hot** | 热销 | 热销标签 |
| **limited** | 限量 | 限量标签 |
| **vip_only** | VIP专属 | VIP标签 |
| **discount** | 打折 | 打折标签 |

---

## 🔍 查询示例

### 查询服装分类的热销商品

```sql
SELECT
  p.id, p.name, p.subtitle,
  pp.current_price,
  ps.sales_count, ps.average_rating
FROM products p
LEFT JOIN product_prices pp ON p.id = pp.product_id
LEFT JOIN product_stats ps ON p.id = ps.product_id
LEFT JOIN product_tags pt ON p.id = pt.product_id
WHERE p.category_id = 1
  AND pt.tag_name = 'hot'
ORDER BY ps.sales_count DESC;
```

**结果示例：**
```
黑色真丝连衣裙 | 春夏新款·显气质 | ¥998.00 | 销量1250 | 评分4.7
```

### 查询价格在500-1000元的商品

```sql
SELECT
  p.id, p.name, p.subtitle,
  pp.original_price, pp.current_price,
  c.name as category
FROM products p
LEFT JOIN product_prices pp ON p.id = pp.product_id
LEFT JOIN categories c ON p.category_id = c.id
WHERE pp.current_price BETWEEN 50000 AND 100000
ORDER BY pp.current_price;
```

### 查询评分最高的商品

```sql
SELECT
  p.id, p.name,
  ps.average_rating, ps.reviews_count,
  ps.sales_count
FROM products p
LEFT JOIN product_stats ps ON p.id = ps.product_id
ORDER BY ps.average_rating DESC, ps.reviews_count DESC
LIMIT 10;
```

### 查询指定商品的完整信息

```sql
SELECT
  p.*,
  pp.original_price, pp.current_price, pp.discount_rate,
  ps.sales_count, ps.average_rating,
  GROUP_CONCAT(pt.tag_name) as tags,
  GROUP_CONCAT(DISTINCT pi.image_url) as images
FROM products p
LEFT JOIN product_prices pp ON p.id = pp.product_id
LEFT JOIN product_stats ps ON p.id = ps.product_id
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.id = 1
GROUP BY p.id;
```

---

## 📱 在小程序中使用

### 分类列表页

```vue
<template>
  <view class="category-page">
    <view class="category-list">
      <view class="category-item"
            v-for="category in categories"
            :key="category.id"
            @click="selectCategory(category)">
        <image :src="category.iconUrl" />
        <text>{{ category.name }}</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="product-list">
      <view class="product-item" v-for="product in products" :key="product.id">
        <!-- 图片 -->
        <image :src="product.imageUrl" mode="aspectFill" />

        <!-- 标签 -->
        <view class="tags">
          <span v-if="product.tags.includes('new')" class="tag-new">新品</span>
          <span v-if="product.tags.includes('hot')" class="tag-hot">热销</span>
          <span v-if="product.tags.includes('discount')" class="tag-discount">打折</span>
        </view>

        <!-- 标题 -->
        <view class="product-title">{{ product.name }}</view>

        <!-- 小标题 -->
        <view class="product-subtitle">{{ product.subtitle }}</view>

        <!-- 价格 -->
        <view class="product-price">
          <text class="current">¥{{ formatPrice(product.currentPrice) }}</text>
          <text class="discount" v-if="product.discountRate < 100">
            {{ product.discountRate }}折
          </text>
          <text class="original" v-if="product.discountRate < 100">
            ¥{{ formatPrice(product.originalPrice) }}
          </text>
        </view>

        <!-- 统计 -->
        <view class="product-stats">
          <text>销量{{ product.salesCount }}</text>
          <text>{{ product.averageRating }}⭐</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Category {
  id: number
  name: string
  slug: string
  iconUrl: string
}

interface Product {
  id: number
  name: string
  subtitle: string
  imageUrl: string
  originalPrice: number
  currentPrice: number
  discountRate: number
  salesCount: number
  averageRating: number
  tags: string[]
}

const categories = ref<Category[]>([])
const products = ref<Product[]>([])
const selectedCategoryId = ref<number>(1)

// 获取分类列表
const fetchCategories = async () => {
  const response = await fetch('/api/categories')
  categories.value = await response.json()
}

// 获取商品列表
const fetchProducts = async (categoryId: number) => {
  const response = await fetch(`/api/products?categoryId=${categoryId}`)
  products.value = await response.json()
}

// 选择分类
const selectCategory = (category: Category) => {
  selectedCategoryId.value = category.id
  fetchProducts(category.id)
}

// 格式化价格
const formatPrice = (price: number) => {
  return (price / 100).toFixed(2)
}

onMounted(() => {
  fetchCategories()
  fetchProducts(1)
})
</script>

<style scoped>
.product-item {
  position: relative;
  margin-bottom: 12px;
}

.tags {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
}

.tag-new {
  background: #ff6b6b;
  color: white;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 2px;
}

.tag-hot {
  background: #ffa500;
  color: white;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 2px;
}

.tag-discount {
  background: #ff1744;
  color: white;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 2px;
}

.product-title {
  font-weight: 600;
  font-size: 14px;
  margin: 8px 0 2px;
}

.product-subtitle {
  color: #999;
  font-size: 12px;
  margin-bottom: 6px;
}

.product-price {
  margin: 4px 0;
}

.current {
  color: #ff1744;
  font-weight: 600;
  font-size: 14px;
  margin-right: 4px;
}

.discount {
  background: #ff1744;
  color: white;
  padding: 2px 4px;
  font-size: 11px;
  border-radius: 2px;
  margin-right: 4px;
}

.original {
  color: #999;
  font-size: 12px;
  text-decoration: line-through;
}

.product-stats {
  color: #666;
  font-size: 11px;
  margin-top: 4px;
}
</style>
```

---

## 🎯 后续扩展

### 添加新的商品

```sql
-- 1. 插入商品基本信息
INSERT INTO products (name, subtitle, sku, description, category_id, stock_quantity)
VALUES ('新商品名称', '新商品副标题', 'NEW-001', '商品描述', 1, 50);

SET @product_id = LAST_INSERT_ID();

-- 2. 插入价格信息
INSERT INTO product_prices (product_id, original_price, current_price, discount_rate)
VALUES (@product_id, 100000, 79900, 80);

-- 3. 插入图片
INSERT INTO product_images (product_id, image_url, image_type)
VALUES (@product_id, 'https://...', 'cover');

-- 4. 插入统计数据
INSERT INTO product_stats (product_id, sales_count, views_count, average_rating)
VALUES (@product_id, 0, 0, 0);

-- 5. 添加标签
INSERT INTO product_tags (product_id, tag_name)
VALUES (@product_id, 'new');
```

### 修改商品信息

```sql
-- 更新商品标题和小标题
UPDATE products
SET name = '新的标题', subtitle = '新的小标题'
WHERE id = 1;

-- 更新价格
UPDATE product_prices
SET current_price = 89900, discount_rate = 90
WHERE product_id = 1;

-- 更新库存
UPDATE products
SET stock_quantity = 100
WHERE id = 1;
```

---

## 📚 相关文档

- 📄 **完整商品规范**: `PRODUCT_SPECIFICATION.md`
- 💾 **数据库设计**: `DATABASE_SCHEMA_DESIGN.md`
- 🗄️ **建表脚本**: `nestapi/src/database/schema.sql`
- 📊 **初始化脚本**: `nestapi/src/database/init-data.sql`

---

## ✅ 检查清单

导入后请验证：

- [ ] 分类表有 4 条记录
- [ ] 商品表有 12 条记录
- [ ] 价格表有 12 条记录
- [ ] 图片表有 39+ 条记录
- [ ] 属性表有 18+ 条记录
- [ ] 统计表有 12 条记录
- [ ] 标签表有 14+ 条记录
- [ ] 可以查询商品详情
- [ ] 可以按分类查询商品
- [ ] 可以按价格排序商品

---

**数据导入完成！可以开始应用开发了！** 🎉
