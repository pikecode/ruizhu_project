# 商品数据规范 - 瑞竹电商平台

完整的商品信息结构定义，包括所有字段、分类、属性和示例数据。

---

## 📋 商品基本信息

### 商品字段列表

| 字段中文名 | 字段名 | 数据类型 | 必需 | 说明 |
|-----------|--------|---------|------|------|
| **商品ID** | id | INT | ✅ | 唯一标识符 |
| **大标题** | name | VARCHAR(200) | ✅ | 商品主标题，例如：黑色真丝连衣裙 |
| **小标题** | subtitle | VARCHAR(200) | ❌ | 商品副标题，例如：春夏新款·显气质 |
| **SKU** | sku | VARCHAR(100) | ✅ | 商品编码，唯一标识，例如：CLT-001 |
| **描述** | description | TEXT | ❌ | 商品简短描述 |
| **分类ID** | category_id | INT | ✅ | 所属分类 |
| **是否新品** | is_new | TINYINT(1) | ✅ | 新品标记（0/1） |
| **是否上架** | is_sale_on | TINYINT(1) | ✅ | 上架状态（0/1） |
| **是否缺货** | is_out_of_stock | TINYINT(1) | ✅ | 缺货状态（0/1） |
| **是否售罄** | is_sold_out | TINYINT(1) | ✅ | 售罄状态（0/1） |
| **VIP专属** | is_vip_only | TINYINT(1) | ✅ | VIP标记（0/1） |
| **库存数量** | stock_quantity | INT | ✅ | 当前库存 |
| **库存预警** | low_stock_threshold | INT | ✅ | 库存预警阈值（默认10） |
| **重量** | weight | INT | ❌ | 商品重量（克） |
| **运费模板** | shipping_template_id | INT | ❌ | 关联的运费模板 |
| **免运费额度** | free_shipping_threshold | DECIMAL(10,2) | ❌ | 满额免运费（元） |
| **创建时间** | created_at | TIMESTAMP | ✅ | 系统自动 |
| **更新时间** | updated_at | TIMESTAMP | ✅ | 系统自动 |

---

## 💰 商品价格信息

### 价格字段列表

| 字段中文名 | 字段名 | 数据类型 | 说明 |
|-----------|--------|---------|------|
| **价格ID** | id | INT | 主键 |
| **商品ID** | product_id | INT | 关联商品 |
| **原价** | original_price | INT | 原价（分为单位）|
| **现价** | current_price | INT | 现价（分为单位）|
| **折扣率** | discount_rate | TINYINT | 折扣率（0-100），例如78表示78折 |
| **货币** | currency | CHAR(3) | CNY（人民币）或 USD（美元） |
| **VIP折扣** | vip_discount_rate | TINYINT | VIP用户折扣率（可选） |

### 价格示例

```javascript
// 数据库存储
{
  product_id: 1,
  original_price: 128800,    // 1288.00 元
  current_price: 99800,      // 998.00 元
  discount_rate: 78,         // 78 折
  currency: 'CNY'
}

// 转换为显示格式
formatPrice(128800) = "1288.00"
formatPrice(99800) = "998.00"
```

---

## 🖼️ 商品图片信息

### 图片字段列表

| 字段中文名 | 字段名 | 数据类型 | 说明 |
|-----------|--------|---------|------|
| **图片ID** | id | INT | 主键 |
| **商品ID** | product_id | INT | 关联商品 |
| **图片URL** | image_url | VARCHAR(500) | 图片链接 |
| **图片类型** | image_type | ENUM | thumb/cover/list/detail |
| **ALT文本** | alt_text | VARCHAR(200) | SEO用文本 |
| **排序** | sort_order | INT | 显示顺序 |
| **宽度** | width | INT | 图片宽度（像素） |
| **高度** | height | INT | 图片高度（像素） |
| **文件大小** | file_size | INT | 文件大小（字节） |

### 图片类型说明

| 类型 | 尺寸 | 用途 | 示例 |
|------|------|------|------|
| **thumb** | 200×200 | 列表页缩略图 | 商品列表、搜索结果 |
| **cover** | 400×400 | 列表页封面 | 分类页、搜索结果 |
| **list** | 400×400 | 列表页（多张） | 商品列表详情 |
| **detail** | 800×800+ | 详情页高清图 | 商品详情页、图片轮播 |

### 图片示例

```sql
-- 同一商品的多张图片
INSERT INTO product_images VALUES
(1, 1, 'url/to/thumb.jpg', 'thumb', '商品缩略图', 1),
(2, 1, 'url/to/cover.jpg', 'cover', '商品封面', 1),
(3, 1, 'url/to/detail-1.jpg', 'detail', '详情图1', 1),
(4, 1, 'url/to/detail-2.jpg', 'detail', '详情图2', 2);
```

---

## 🏷️ 商品分类

### 支持的分类

| 分类ID | 分类名 | 英文名 | 描述 |
|--------|--------|--------|------|
| 1 | **服装** | clothing | 包括连衣裙、T恤、外套、衬衫等 |
| 2 | **珠宝** | jewelry | 包括项链、手镯、耳环、戒指等 |
| 3 | **鞋履** | shoes | 包括高跟鞋、运动鞋、靴子等 |
| 4 | **香水** | perfume | 包括女性香水、男性香水等 |

### 分类字段

```sql
CREATE TABLE categories (
  id INT PRIMARY KEY,              -- 分类ID
  name VARCHAR(100) NOT NULL,      -- 分类名称（服装）
  slug VARCHAR(100) NOT NULL,      -- URL友好名称（clothing）
  description VARCHAR(500),        -- 分类描述
  icon_url VARCHAR(255),           -- 分类图标
  sort_order INT DEFAULT 0,        -- 排序权重
  is_active TINYINT(1) DEFAULT 1   -- 是否启用
);
```

---

## 🎨 商品属性（颜色、尺码等）

### 属性类型

| 属性名 | 数据类型 | 用途 | 示例 |
|--------|---------|------|------|
| **color** | 字符串 | 颜色选择 | 黑色、白色、红色 |
| **size** | 字符串 | 尺码选择 | XS、S、M、L、XL 或 35、36、37... |
| **material** | 字符串 | 材质说明 | 皮革、羊毛、棉布 |

### 属性字段

```sql
CREATE TABLE product_attributes (
  id INT PRIMARY KEY,
  product_id INT,                    -- 商品ID
  attribute_name VARCHAR(50),        -- 属性名：color/size
  attribute_value VARCHAR(200),      -- 属性值：黑色/M
  color_hex VARCHAR(7),              -- 颜色值：#000000
  stock_quantity INT,                -- 该属性的库存
  size_sort_order INT                -- 尺码排序
);
```

### 属性示例

```javascript
// 黑色真丝连衣裙的属性
{
  颜色: ['黑色', '白色', '深蓝'],
  尺码: ['XS', 'S', 'M', 'L']
}

// 每个属性组合的库存
黑色 + M = 5件
白色 + M = 8件
深蓝 + L = 3件
```

---

## 📊 商品统计数据

### 统计字段

| 字段中文名 | 字段名 | 数据类型 | 说明 |
|-----------|--------|---------|------|
| **销量** | sales_count | INT | 已售商品数 |
| **浏览量** | views_count | INT | 页面浏览次数 |
| **平均评分** | average_rating | DECIMAL(3,2) | 0-5分 |
| **评价数** | reviews_count | INT | 用户评价总数 |
| **收藏数** | favorites_count | INT | 被收藏次数 |
| **转化率** | conversion_rate | DECIMAL(5,2) | 浏览到购买比例(%) |
| **最后购买时间** | last_sold_at | TIMESTAMP | 最后一次售出时间 |

### 统计示例

```javascript
{
  product_id: 1,
  sales_count: 1250,           // 已售1250件
  views_count: 8500,           // 浏览8500次
  average_rating: 4.7,         // 平均4.7星
  reviews_count: 168,          // 168条评价
  favorites_count: 580,        // 被收藏580次
  conversion_rate: 14.7        // 转化率14.7%
}
```

---

## 🏷️ 商品标签

### 支持的标签

| 标签名 | 标签值 | 用途 | 显示位置 |
|--------|--------|------|---------|
| **新品** | new | 标记新上市商品 | 列表页右上角 |
| **热销** | hot | 标记热销商品 | 列表页右上角 |
| **限量** | limited | 标记限量商品 | 列表页右上角 |
| **VIP专属** | vip_only | 标记VIP用户专享 | 列表页右上角 |
| **打折** | discount | 标记有折扣 | 列表页右上角 |

### 标签字段

```sql
CREATE TABLE product_tags (
  id INT PRIMARY KEY,
  product_id INT,              -- 商品ID
  tag_name VARCHAR(50)         -- 标签名
);
```

### 标签示例

```javascript
// 商品1的标签
{
  product_id: 1,
  tags: ['new', 'hot']  // 既是新品，又是热销
}

// 商品4的标签
{
  product_id: 4,
  tags: ['hot', 'vip_only']  // 热销且VIP专属
}
```

---

## 📝 商品详情信息

### 详情字段

| 字段中文名 | 字段名 | 数据类型 | 说明 |
|-----------|--------|---------|------|
| **品牌** | brand | VARCHAR(100) | 商品品牌 |
| **材质** | material | VARCHAR(200) | 商品主要材质 |
| **产地** | origin | VARCHAR(100) | 商品生产地 |
| **重量** | weight_value | DECIMAL(8,2) | 商品实际重量(克) |
| **尺寸** | length/width/height | DECIMAL(8,2) | 商品尺寸(厘米) |
| **完整描述** | full_description | LONGTEXT | HTML格式的完整描述 |
| **卖点** | highlights | LONGTEXT | JSON数组格式的卖点列表 |
| **护理指南** | care_guide | TEXT | 如何护理商品 |
| **保修信息** | warranty | TEXT | 保修时间和范围 |
| **SEO关键词** | seo_keywords | VARCHAR(500) | 搜索引擎关键词 |
| **SEO描述** | seo_description | VARCHAR(500) | 搜索引擎描述 |

### 详情示例

```html
<!-- 黑色真丝连衣裙详情 -->
<h2>黑色真丝连衣裙</h2>
<p>采用意大利进口桑蚕真丝面料，手感顺滑，垂感优美。
简洁的A字版型设计，修身显气质，适合各种场合穿着。</p>

<h3>产品特点：</h3>
<ul>
  <li>100%真丝面料，透气舒适</li>
  <li>精工细作，缝线均匀</li>
  <li>简约大气设计风格</li>
  <li>显气质百搭款</li>
</ul>

<h3>护理指南：</h3>
<p>冷水洗涤，不可漂白，自然干燥，低温熨烫</p>

<h3>保修：</h3>
<p>非人为原因质量问题，售出30天内退换</p>
```

---

## 📦 完整商品示例

### 示例 1：黑色真丝连衣裙

```json
{
  "商品基本信息": {
    "id": 1,
    "大标题": "黑色真丝连衣裙",
    "小标题": "春夏新款 · 显气质",
    "SKU": "CLT-001",
    "分类": "服装",
    "库存": 45,
    "是否新品": true,
    "是否上架": true,
    "状态标签": ["new", "hot"]
  },

  "价格信息": {
    "原价": "1288.00元",
    "现价": "998.00元",
    "折扣": "78折"
  },

  "图片": [
    {
      "类型": "thumb",
      "URL": "url/to/thumb.jpg",
      "尺寸": "200×200"
    },
    {
      "类型": "cover",
      "URL": "url/to/cover.jpg",
      "尺寸": "400×400"
    },
    {
      "类型": "detail",
      "URL": "url/to/detail-1.jpg",
      "尺寸": "800×800"
    },
    {
      "类型": "detail",
      "URL": "url/to/detail-2.jpg",
      "尺寸": "800×800"
    }
  ],

  "属性": {
    "颜色": ["黑色", "白色", "深蓝"],
    "尺码": ["XS", "S", "M", "L"]
  },

  "统计": {
    "销量": 1250,
    "浏览": 8500,
    "评分": 4.7,
    "评价": 168,
    "收藏": 580
  },

  "详情": {
    "品牌": "瑞竹时装",
    "材质": "100%真丝",
    "产地": "中国",
    "完整描述": "HTML格式的详细描述...",
    "护理": "冷水洗涤，不可漂白，自然干燥，低温熨烫",
    "保修": "非人为原因质量问题，售出30天内退换"
  }
}
```

### 示例 2：白色运动鞋

```json
{
  "商品基本信息": {
    "id": 8,
    "大标题": "白色运动鞋",
    "小标题": "百搭款 · 舒适透气",
    "SKU": "SHO-002",
    "分类": "鞋履",
    "库存": 72,
    "是否新品": false,
    "是否上架": true,
    "状态标签": ["hot"]
  },

  "价格信息": {
    "原价": "499.00元",
    "现价": "399.00元",
    "折扣": "80折"
  },

  "图片": [
    {
      "类型": "thumb",
      "URL": "url/to/white-sneakers-thumb.jpg"
    },
    {
      "类型": "cover",
      "URL": "url/to/white-sneakers-cover.jpg"
    },
    {
      "类型": "detail",
      "URL": "url/to/white-sneakers-detail-1.jpg"
    }
  ],

  "属性": {
    "颜色": ["白色", "黑白", "灰白"],
    "尺码": ["35", "36", "37", "38", "39", "40"]
  },

  "统计": {
    "销量": 2100,
    "浏览": 11500,
    "评分": 4.7,
    "评价": 285,
    "收藏": 850
  },

  "详情": {
    "品牌": "瑞竹鞋履",
    "材质": "网布+泡沫垫",
    "产地": "中国"
  }
}
```

---

## 🔄 查询商品的完整流程

### 1. 获取商品列表（分类页面）

```sql
SELECT
  p.id, p.name, p.subtitle,
  pp.original_price, pp.current_price, pp.discount_rate,
  pi.image_url,
  ps.sales_count, ps.average_rating,
  GROUP_CONCAT(DISTINCT pt.tag_name) as tags
FROM products p
LEFT JOIN product_prices pp ON p.id = pp.product_id
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.image_type = 'cover'
LEFT JOIN product_stats ps ON p.id = ps.product_id
LEFT JOIN product_tags pt ON p.id = pt.product_id
WHERE p.category_id = 1 AND p.is_sale_on = 1
GROUP BY p.id
ORDER BY ps.sales_count DESC
LIMIT 20;
```

**返回数据**:
- 大标题、小标题
- 价格（原价、现价、折扣）
- 封面图片
- 销量、评分
- 标签

### 2. 获取商品详情（详情页面）

```sql
SELECT p.*,
  pp.original_price, pp.current_price, pp.discount_rate,
  GROUP_CONCAT(DISTINCT pi.image_url) as detail_images,
  ps.*,
  pd.*,
  GROUP_CONCAT(DISTINCT pa.attribute_value) as attributes
FROM products p
LEFT JOIN product_prices pp ON p.id = pp.product_id
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.image_type = 'detail'
LEFT JOIN product_stats ps ON p.id = ps.product_id
LEFT JOIN product_details pd ON p.id = pd.product_id
LEFT JOIN product_attributes pa ON p.id = pa.product_id
WHERE p.id = 1
GROUP BY p.id;
```

**返回数据**:
- 完整商品信息
- 所有图片
- 完整描述、护理、保修
- 所有属性和库存
- 统计数据

---

## 📱 前端应用中的使用

### Vue 3 + TypeScript 中的类型定义

```typescript
// 商品列表项
interface ProductListItem {
  id: number;
  name: string;              // 大标题
  subtitle?: string;         // 小标题
  sku: string;
  imageUrl: string;          // 封面图
  originalPrice: number;     // 原价（分）
  currentPrice: number;      // 现价（分）
  discountRate: number;      // 折扣率
  salesCount: number;        // 销量
  averageRating: number;     // 评分
  tags: string[];            // 标签
}

// 商品详情
interface ProductDetail extends ProductListItem {
  description: string;       // 简述
  images: ProductImage[];    // 所有图片
  attributes: ProductAttribute[];  // 属性
  stats: ProductStats;       // 统计
  details: {
    brand: string;
    material: string;
    origin: string;
    fullDescription: string;
    careGuide: string;
    warranty: string;
  };
}
```

### 小程序中的使用

```vue
<!-- 商品列表 -->
<view class="product-list">
  <view class="product-item" v-for="product in products" :key="product.id">
    <!-- 图片 -->
    <image :src="product.imageUrl" mode="aspectFill" />

    <!-- 标签 -->
    <view class="tags">
      <span class="tag new" v-if="product.tags.includes('new')">新品</span>
      <span class="tag hot" v-if="product.tags.includes('hot')">热销</span>
    </view>

    <!-- 标题 -->
    <view class="title">{{ product.name }}</view>

    <!-- 小标题 -->
    <view class="subtitle">{{ product.subtitle }}</view>

    <!-- 价格 -->
    <view class="price">
      <span class="current">¥{{ formatPrice(product.currentPrice) }}</span>
      <span class="discount" v-if="product.discountRate < 100">
        {{ product.discountRate }}折
      </span>
      <span class="original">¥{{ formatPrice(product.originalPrice) }}</span>
    </view>

    <!-- 统计 -->
    <view class="stats">
      <span>销量: {{ product.salesCount }}</span>
      <span>评分: {{ product.averageRating }}⭐</span>
    </view>
  </view>
</view>
```

---

## 💾 导入数据步骤

### 1. 创建数据库

```bash
mysql -u root -p
CREATE DATABASE ruizhu_ecommerce CHARACTER SET utf8mb4;
USE ruizhu_ecommerce;
```

### 2. 导入基础表结构

```bash
mysql -u root -p ruizhu_ecommerce < nestapi/src/database/schema.sql
```

### 3. 导入初始化数据

```bash
mysql -u root -p ruizhu_ecommerce < nestapi/src/database/init-data.sql
```

### 4. 验证导入成功

```sql
-- 检查分类
SELECT COUNT(*) as category_count FROM categories;
-- 输出: 4

-- 检查商品
SELECT COUNT(*) as product_count FROM products;
-- 输出: 12

-- 检查价格
SELECT COUNT(*) as price_count FROM product_prices;
-- 输出: 12

-- 查看商品列表
SELECT id, name, subtitle, sku FROM products LIMIT 5;
```

---

## 🎯 总结

### 完整商品数据包含：

✅ **基本信息**: 大标题、小标题、描述、SKU、分类
✅ **价格信息**: 原价、现价、折扣率
✅ **图片**: 缩略图、封面图、详情图
✅ **属性**: 颜色、尺码、材质等可选属性
✅ **统计**: 销量、评分、评价、收藏
✅ **标签**: 新品、热销、限量、VIP专属、打折
✅ **详情**: 品牌、材质、产地、完整描述、护理、保修
✅ **库存**: 库存数量、预警阈值、按属性库存

### 初始化数据包括：

📁 **4个分类**: 服装、珠宝、鞋履、香水
📦 **12个示例商品**: 每个分类3个商品
💳 **完整的商品信息**: 大标题、小标题、描述、价格、图片、属性
🏷️ **灵活的标签系统**: new、hot、limited、vip_only、discount

---

**商品数据规范完整！可以直接导入使用。** ✨
