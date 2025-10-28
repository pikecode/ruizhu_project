# 数据库表结构设计 - 瑞竹电商平台

完整的数据库架构设计，基于产品数据模型设计文档。支持列表、详情、购物车、订单等完整电商流程。

---

## 目录

1. [设计概览](#设计概览)
2. [核心表结构](#核心表结构)
3. [完整SQL建表语句](#完整sql建表语句)
4. [表关系图](#表关系图)
5. [索引策略](#索引策略)
6. [查询优化](#查询优化)
7. [示例数据](#示例数据)
8. [迁移指南](#迁移指南)

---

## 设计概览

### 核心设计原则

1. **数据完整性**: 包含完整的商品、分类、价格、库存等信息
2. **规范化**: 避免数据重复，遵循第三范式
3. **可扩展性**: 支持属性、评价、统计数据的灵活扩展
4. **性能优先**: 合理使用索引，减少关联查询
5. **易维护性**: 清晰的命名约定和表关系

### 表结构概览

| 表名 | 说明 | 主要字段 |
|------|------|---------|
| **categories** | 分类表 | id, name, slug, description |
| **products** | 商品表 | id, name, description, category_id, stock_quantity |
| **product_prices** | 价格表 | id, product_id, original_price, current_price, discount |
| **product_images** | 图片表 | id, product_id, image_url, image_type, sort_order |
| **product_stats** | 统计表 | id, product_id, sales, views, rating, reviews_count |
| **product_attributes** | 属性表 | id, product_id, attribute_name, attribute_values |
| **product_details** | 详情表 | id, product_id, brand, material, origin, content |
| **product_reviews** | 评价表 | id, product_id, user_id, rating, comment, images |
| **product_tags** | 标签表 | id, product_id, tag_name |
| **cart_items** | 购物车表 | id, user_id, product_id, quantity, selected_attributes |
| **orders** | 订单表 | id, user_id, order_no, total_amount, status |
| **order_items** | 订单商品表 | id, order_id, product_id, quantity, price_snapshot |
| **order_refunds** | 退款表 | id, order_item_id, reason, status, amount |

---

## 核心表结构

### 1. 分类表 (categories)

```sql
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
  name VARCHAR(100) NOT NULL UNIQUE COMMENT '分类名称: 手袋, 钱包, 背包, 配件',
  slug VARCHAR(100) NOT NULL UNIQUE COMMENT 'URL slug: bags, wallets, backpacks',
  description VARCHAR(500) COMMENT '分类描述',
  icon_url VARCHAR(255) COMMENT '分类图标',
  sort_order INT DEFAULT 0 COMMENT '排序权重',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  parent_id INT COMMENT '父分类ID (支持多级分类)',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uk_slug (slug),
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  KEY idx_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';
```

**字段说明**:
- `slug`: 用于 URL 友好路由，如 `/category/bags`
- `sort_order`: 用于分类页展示顺序
- `parent_id`: 支持树形分类结构（二级分类）

---

### 2. 商品表 (products)

```sql
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
  name VARCHAR(200) NOT NULL COMMENT '商品名称',
  sku VARCHAR(100) NOT NULL UNIQUE COMMENT '商品SKU',
  description TEXT COMMENT '商品简述',
  category_id INT NOT NULL COMMENT '分类ID',

  -- 状态字段
  is_new TINYINT(1) DEFAULT 0 COMMENT '是否新品',
  is_sale_on TINYINT(1) DEFAULT 1 COMMENT '是否上架',
  is_out_of_stock TINYINT(1) DEFAULT 0 COMMENT '是否缺货',
  is_sold_out TINYINT(1) DEFAULT 0 COMMENT '是否售罄',
  is_vip_only TINYINT(1) DEFAULT 0 COMMENT '是否VIP专属',

  -- 库存字段
  stock_quantity INT DEFAULT 0 COMMENT '库存数量',
  low_stock_threshold INT DEFAULT 10 COMMENT '库存预警阈值',

  -- 运费信息
  weight INT COMMENT '重量(克)',
  shipping_template_id INT COMMENT '运费模板ID',
  free_shipping_threshold DECIMAL(10, 2) COMMENT '免运费额度(元)',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  UNIQUE KEY uk_sku (sku),
  KEY idx_category (category_id),
  KEY idx_sale_status (is_sale_on, is_out_of_stock),
  KEY idx_created_at (created_at),
  FULLTEXT KEY ft_name_desc (name, description) COMMENT '全文搜索'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';
```

**字段说明**:
- `sku`: 库存单位，用于区分不同规格
- 状态字段分离: 便于快速过滤和查询
- `FULLTEXT` 索引: 支持商品名称和描述的全文搜索
- `weight`: 用于计算物流成本

---

### 3. 价格表 (product_prices)

```sql
CREATE TABLE IF NOT EXISTS product_prices (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '价格ID',
  product_id INT NOT NULL UNIQUE COMMENT '商品ID',

  original_price INT NOT NULL COMMENT '原价(分为单位: 12800 = 128.00元)',
  current_price INT NOT NULL COMMENT '现价(分为单位)',
  discount_rate TINYINT DEFAULT 100 COMMENT '折扣率(0-100): 78表示78折',
  currency CHAR(3) DEFAULT 'CNY' COMMENT '货币类型: CNY/USD',

  -- 价格历史
  price_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- VIP相关
  vip_discount_rate TINYINT COMMENT 'VIP折扣率',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  KEY idx_product (product_id),
  KEY idx_current_price (current_price) COMMENT '用于价格排序'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品价格表';
```

**设计说明**:
- **单位**: 所有价格都以 **分** 为单位（元 × 100），避免浮点数精度问题
- **分离原因**: 与商品表分离，便于价格历史追踪和定期更新
- **VIP折扣**: 支持不同用户等级的价格差异

---

### 4. 商品图片表 (product_images)

```sql
CREATE TABLE IF NOT EXISTS product_images (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '图片ID',
  product_id INT NOT NULL COMMENT '商品ID',
  image_url VARCHAR(500) NOT NULL COMMENT '图片URL',
  image_type ENUM('thumb', 'cover', 'list', 'detail') DEFAULT 'cover' COMMENT '图片类型',
  -- thumb: 缩略图 200x200
  -- cover: 封面图 400x400
  -- list: 列表页 400x400
  -- detail: 详情页 800x800+

  alt_text VARCHAR(200) COMMENT '图片ALT文本(SEO)',
  sort_order INT DEFAULT 0 COMMENT '排序(小到大)',

  -- 可选：图片尺寸信息
  width INT COMMENT '图片宽度',
  height INT COMMENT '图片高度',
  file_size INT COMMENT '文件大小(字节)',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  KEY idx_product_type (product_id, image_type),
  KEY idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品图片表';
```

**设计说明**:
- **多图片支持**: 一个商品可以有多张图片
- **图片类型**: 不同场景使用不同尺寸，减少带宽浪费
- **排序**: 通过 `sort_order` 控制图片顺序
- **SEO**: `alt_text` 用于搜索引擎优化

---

### 5. 商品统计表 (product_stats)

```sql
CREATE TABLE IF NOT EXISTS product_stats (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '统计ID',
  product_id INT NOT NULL UNIQUE COMMENT '商品ID',

  sales_count INT DEFAULT 0 COMMENT '销量(用于热销排序)',
  views_count INT DEFAULT 0 COMMENT '浏览量',
  average_rating DECIMAL(3, 2) DEFAULT 0 COMMENT '平均评分(0-5)',
  reviews_count INT DEFAULT 0 COMMENT '评价数量',
  favorites_count INT DEFAULT 0 COMMENT '收藏数',

  -- 可选：转化率统计
  conversion_rate DECIMAL(5, 2) COMMENT '转化率(%)',
  last_sold_at TIMESTAMP COMMENT '最后购买时间',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  KEY idx_sales (sales_count) COMMENT '热销排序',
  KEY idx_rating (average_rating) COMMENT '评分排序',
  KEY idx_favorites (favorites_count) COMMENT '收藏排序'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品统计表';
```

**设计说明**:
- **独立表**: 将统计数据独立出来，避免主表过于复杂
- **频繁更新**: 这些字段会频繁更新，独立表便于优化
- **索引**: 为常用排序字段建立索引

---

### 6. 商品属性表 (product_attributes)

```sql
CREATE TABLE IF NOT EXISTS product_attributes (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '属性ID',
  product_id INT NOT NULL COMMENT '商品ID',
  attribute_name VARCHAR(50) NOT NULL COMMENT '属性名: color, size, material',
  attribute_value VARCHAR(200) NOT NULL COMMENT '属性值: 黑色, M, 皮革',

  -- 可选字段
  attribute_sku_suffix VARCHAR(50) COMMENT '属性SKU后缀',
  additional_price INT DEFAULT 0 COMMENT '属性价格差(分)',
  stock_quantity INT DEFAULT 0 COMMENT '该属性的库存',

  -- 用于颜色
  color_hex VARCHAR(7) COMMENT '颜色十六进制值: #000000',

  -- 用于尺码
  size_sort_order INT COMMENT '尺码排序',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  KEY idx_product_attr (product_id, attribute_name),
  UNIQUE KEY uk_product_attr_value (product_id, attribute_name, attribute_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品属性表(颜色/尺码/材质等)';
```

**设计说明**:
- **灵活属性**: 支持任意属性名称和值的组合
- **库存管理**: 支持按属性组合管理库存
- **价格差异**: 不同属性可能有不同价格
- **颜色/尺码**: 支持专属字段

---

### 7. 商品详情表 (product_details)

```sql
CREATE TABLE IF NOT EXISTS product_details (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '详情ID',
  product_id INT NOT NULL UNIQUE COMMENT '商品ID',

  -- 基本信息
  brand VARCHAR(100) COMMENT '品牌',
  material VARCHAR(200) COMMENT '材质: 皮革, 牛仔布',
  origin VARCHAR(100) COMMENT '产地: 意大利, 中国',
  weight_value DECIMAL(8, 2) COMMENT '产品重量(克)',

  -- 尺寸信息
  length DECIMAL(8, 2) COMMENT '长度(cm)',
  width DECIMAL(8, 2) COMMENT '宽度(cm)',
  height DECIMAL(8, 2) COMMENT '高度(cm)',

  -- 详细描述
  full_description LONGTEXT COMMENT '完整HTML描述',
  highlights LONGTEXT COMMENT '卖点列表(JSON数组)',
  care_guide TEXT COMMENT '护理指南',
  warranty TEXT COMMENT '保修信息',

  -- SEO 信息
  seo_keywords VARCHAR(500) COMMENT 'SEO关键词',
  seo_description VARCHAR(500) COMMENT 'SEO描述',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品详情表';
```

**设计说明**:
- **独立表**: 详情页才需要加载，分离出来可以优化查询性能
- **HTML描述**: 使用 `LONGTEXT` 存储 HTML 格式的富文本
- **JSON存储**: `highlights` 可用 JSON 格式存储卖点列表

---

### 8. 商品评价表 (product_reviews)

```sql
CREATE TABLE IF NOT EXISTS product_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '评价ID',
  product_id INT NOT NULL COMMENT '商品ID',
  user_id INT NOT NULL COMMENT '用户ID',
  order_item_id INT COMMENT '订单项ID(用于关联已购商品)',

  rating TINYINT NOT NULL COMMENT '评分(1-5)',
  comment TEXT COMMENT '评价内容',
  review_images LONGTEXT COMMENT '评价图片(JSON数组)',

  -- 评价有用性
  helpful_count INT DEFAULT 0 COMMENT '有用数',
  unhelpful_count INT DEFAULT 0 COMMENT '没用数',

  -- 审核
  is_verified_purchase TINYINT(1) DEFAULT 1 COMMENT '是否已购认证',
  is_approved TINYINT(1) DEFAULT 1 COMMENT '是否通过审核',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL,
  KEY idx_product_rating (product_id, rating),
  KEY idx_user (user_id),
  KEY idx_approved (is_approved, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品评价表';
```

**设计说明**:
- **验证购买**: 确保评价来自真实购买用户
- **审核机制**: 支持评价内容审核（防垃圾评价）
- **有用性统计**: 用于评价排序（最有用的评价优先展示）

---

### 9. 商品标签表 (product_tags)

```sql
CREATE TABLE IF NOT EXISTS product_tags (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '标签ID',
  product_id INT NOT NULL COMMENT '商品ID',
  tag_name VARCHAR(50) NOT NULL COMMENT '标签: new(新品), hot(热销), limited(限量), discount(打折)',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uk_product_tag (product_id, tag_name),
  KEY idx_tag (tag_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品标签表';
```

**设计说明**:
- **简单灵活**: 支持任意标签扩展（不需要修改表结构）
- **快速查询**: 通过标签快速找出对应商品

---

### 10. 购物车表 (cart_items)

```sql
CREATE TABLE IF NOT EXISTS cart_items (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '购物车项ID',
  user_id INT NOT NULL COMMENT '用户ID',
  product_id INT NOT NULL COMMENT '商品ID',

  quantity INT NOT NULL DEFAULT 1 COMMENT '购买数量',

  -- 选中的属性
  selected_attributes JSON COMMENT '选中属性(JSON): {"color": "红色", "size": "M"}',
  selected_color_id VARCHAR(100) COMMENT '选中颜色ID',
  selected_size_id VARCHAR(100) COMMENT '选中尺码ID',

  -- 价格快照
  cart_price INT COMMENT '加入购物车时的价格(分)',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_product (user_id, product_id, selected_attributes(50)) COMMENT '同一用户同一商品同一属性唯一',
  KEY idx_user (user_id),
  KEY idx_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';
```

**设计说明**:
- **属性选择**: 存储用户选中的颜色、尺码等
- **价格快照**: 记录加入时的价格，便于对比
- **JSON存储**: 灵活存储任意属性组合
- **唯一约束**: 防止重复加入购物车

---

### 11. 订单表 (orders)

```sql
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
  order_no VARCHAR(100) NOT NULL UNIQUE COMMENT '订单号(用于显示)',
  user_id INT NOT NULL COMMENT '用户ID',

  -- 金额相关
  subtotal INT NOT NULL COMMENT '小计(分)',
  shipping_cost INT DEFAULT 0 COMMENT '运费(分)',
  discount_amount INT DEFAULT 0 COMMENT '折扣金额(分)',
  total_amount INT NOT NULL COMMENT '总金额(分)',

  -- 状态
  status ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded')
         DEFAULT 'pending' COMMENT '订单状态',
  payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid' COMMENT '支付状态',

  -- 收货地址
  shipping_address TEXT COMMENT '收货地址(JSON)',
  receiver_name VARCHAR(100) COMMENT '收货人姓名',
  receiver_phone VARCHAR(20) COMMENT '收货人电话',

  -- 备注和时间
  notes TEXT COMMENT '订单备注',
  paid_at TIMESTAMP NULL COMMENT '支付时间',
  shipped_at TIMESTAMP NULL COMMENT '发货时间',
  delivered_at TIMESTAMP NULL COMMENT '收货时间',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  KEY idx_user (user_id),
  KEY idx_order_no (order_no),
  KEY idx_status (status),
  KEY idx_created (created_at),
  UNIQUE KEY uk_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';
```

**设计说明**:
- **订单号**: 与自增ID分离，用于对外展示（便于变更逻辑）
- **状态机**: 完整的订单生命周期状态
- **价格字段**: 都以分为单位，确保精度
- **地址信息**: 使用 JSON 存储以支持灵活的地址字段

---

### 12. 订单商品表 (order_items)

```sql
CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '订单项ID',
  order_id INT NOT NULL COMMENT '订单ID',
  product_id INT NOT NULL COMMENT '商品ID',

  -- 属性和数量
  quantity INT NOT NULL COMMENT '购买数量',
  selected_attributes JSON COMMENT '选中的属性',

  -- 价格快照 (订单时不变)
  product_name VARCHAR(200) NOT NULL COMMENT '商品名称快照',
  sku VARCHAR(100) COMMENT '商品SKU',
  price_snapshot INT NOT NULL COMMENT '订单时的价格(分)',

  -- 计算字段
  subtotal INT NOT NULL COMMENT '小计 = price * quantity',

  -- 状态
  status ENUM('pending', 'shipped', 'delivered', 'returned', 'refunded') DEFAULT 'pending' COMMENT '项目状态',
  refundable TINYINT(1) DEFAULT 1 COMMENT '是否可退款',
  refund_reason TEXT COMMENT '退款原因',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  KEY idx_order (order_id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单商品表';
```

**设计说明**:
- **价格快照**: 记录订单时的价格，防止后续价格变化影响历史订单
- **商品快照**: 存储订单时的商品名称，防止商品被删除导致订单信息丢失
- **状态独立**: 每个订单项有独立的状态，支持部分退货

---

### 13. 退款表 (order_refunds)

```sql
CREATE TABLE IF NOT EXISTS order_refunds (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '退款ID',
  refund_no VARCHAR(100) NOT NULL UNIQUE COMMENT '退款号',
  order_item_id INT NOT NULL COMMENT '订单项ID',

  -- 退款金额
  refund_amount INT NOT NULL COMMENT '退款金额(分)',

  -- 状态和原因
  status ENUM('pending', 'approved', 'processing', 'completed', 'rejected') DEFAULT 'pending' COMMENT '退款状态',
  refund_reason VARCHAR(500) COMMENT '退款原因',
  refund_description TEXT COMMENT '退款描述',

  -- 退货信息
  return_tracking_no VARCHAR(100) COMMENT '退货单号',
  return_received_at TIMESTAMP NULL COMMENT '收到退货时间',

  -- 处理信息
  processed_by INT COMMENT '处理人ID',
  processed_notes TEXT COMMENT '处理备注',
  processed_at TIMESTAMP NULL COMMENT '处理时间',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  UNIQUE KEY uk_refund_no (refund_no),
  KEY idx_status (status),
  KEY idx_order_item (order_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='退款表';
```

**设计说明**:
- **退款号**: 独立于ID，用于对外展示
- **完整流程**: 从申请、审核、处理到完成
- **退货追踪**: 支持物流单号追踪

---

## 完整SQL建表语句

### 一、完整建表脚本

```sql
-- ============================================
-- 瑞竹电商平台 - 完整数据库建表脚本
-- ============================================

-- 1. 分类表
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
  name VARCHAR(100) NOT NULL UNIQUE COMMENT '分类名称',
  slug VARCHAR(100) NOT NULL UNIQUE COMMENT 'URL slug',
  description VARCHAR(500) COMMENT '分类描述',
  icon_url VARCHAR(255) COMMENT '分类图标',
  sort_order INT DEFAULT 0 COMMENT '排序权重',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  parent_id INT COMMENT '父分类ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_slug (slug),
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  KEY idx_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

-- 2. 商品表
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
  name VARCHAR(200) NOT NULL COMMENT '商品名称',
  sku VARCHAR(100) NOT NULL UNIQUE COMMENT '商品SKU',
  description TEXT COMMENT '商品简述',
  category_id INT NOT NULL COMMENT '分类ID',
  is_new TINYINT(1) DEFAULT 0 COMMENT '是否新品',
  is_sale_on TINYINT(1) DEFAULT 1 COMMENT '是否上架',
  is_out_of_stock TINYINT(1) DEFAULT 0 COMMENT '是否缺货',
  is_sold_out TINYINT(1) DEFAULT 0 COMMENT '是否售罄',
  is_vip_only TINYINT(1) DEFAULT 0 COMMENT '是否VIP专属',
  stock_quantity INT DEFAULT 0 COMMENT '库存数量',
  low_stock_threshold INT DEFAULT 10 COMMENT '库存预警阈值',
  weight INT COMMENT '重量(克)',
  shipping_template_id INT COMMENT '运费模板ID',
  free_shipping_threshold DECIMAL(10, 2) COMMENT '免运费额度(元)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  UNIQUE KEY uk_sku (sku),
  KEY idx_category (category_id),
  KEY idx_sale_status (is_sale_on, is_out_of_stock),
  KEY idx_created_at (created_at),
  FULLTEXT KEY ft_name_desc (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- 3. 价格表
CREATE TABLE IF NOT EXISTS product_prices (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '价格ID',
  product_id INT NOT NULL UNIQUE COMMENT '商品ID',
  original_price INT NOT NULL COMMENT '原价(分)',
  current_price INT NOT NULL COMMENT '现价(分)',
  discount_rate TINYINT DEFAULT 100 COMMENT '折扣率(0-100)',
  currency CHAR(3) DEFAULT 'CNY' COMMENT '货币类型',
  vip_discount_rate TINYINT COMMENT 'VIP折扣率',
  price_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  KEY idx_product (product_id),
  KEY idx_current_price (current_price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品价格表';

-- 4. 商品图片表
CREATE TABLE IF NOT EXISTS product_images (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '图片ID',
  product_id INT NOT NULL COMMENT '商品ID',
  image_url VARCHAR(500) NOT NULL COMMENT '图片URL',
  image_type ENUM('thumb', 'cover', 'list', 'detail') DEFAULT 'cover' COMMENT '图片类型',
  alt_text VARCHAR(200) COMMENT '图片ALT文本',
  sort_order INT DEFAULT 0 COMMENT '排序',
  width INT COMMENT '图片宽度',
  height INT COMMENT '图片高度',
  file_size INT COMMENT '文件大小(字节)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  KEY idx_product_type (product_id, image_type),
  KEY idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品图片表';

-- 5. 商品统计表
CREATE TABLE IF NOT EXISTS product_stats (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '统计ID',
  product_id INT NOT NULL UNIQUE COMMENT '商品ID',
  sales_count INT DEFAULT 0 COMMENT '销量',
  views_count INT DEFAULT 0 COMMENT '浏览量',
  average_rating DECIMAL(3, 2) DEFAULT 0 COMMENT '平均评分',
  reviews_count INT DEFAULT 0 COMMENT '评价数量',
  favorites_count INT DEFAULT 0 COMMENT '收藏数',
  conversion_rate DECIMAL(5, 2) COMMENT '转化率(%)',
  last_sold_at TIMESTAMP NULL COMMENT '最后购买时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  KEY idx_sales (sales_count),
  KEY idx_rating (average_rating),
  KEY idx_favorites (favorites_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品统计表';

-- 6. 商品属性表
CREATE TABLE IF NOT EXISTS product_attributes (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '属性ID',
  product_id INT NOT NULL COMMENT '商品ID',
  attribute_name VARCHAR(50) NOT NULL COMMENT '属性名',
  attribute_value VARCHAR(200) NOT NULL COMMENT '属性值',
  attribute_sku_suffix VARCHAR(50) COMMENT '属性SKU后缀',
  additional_price INT DEFAULT 0 COMMENT '属性价格差',
  stock_quantity INT DEFAULT 0 COMMENT '属性库存',
  color_hex VARCHAR(7) COMMENT '颜色值',
  size_sort_order INT COMMENT '尺码排序',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  KEY idx_product_attr (product_id, attribute_name),
  UNIQUE KEY uk_product_attr_value (product_id, attribute_name, attribute_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品属性表';

-- 7. 商品详情表
CREATE TABLE IF NOT EXISTS product_details (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '详情ID',
  product_id INT NOT NULL UNIQUE COMMENT '商品ID',
  brand VARCHAR(100) COMMENT '品牌',
  material VARCHAR(200) COMMENT '材质',
  origin VARCHAR(100) COMMENT '产地',
  weight_value DECIMAL(8, 2) COMMENT '产品重量(克)',
  length DECIMAL(8, 2) COMMENT '长度(cm)',
  width DECIMAL(8, 2) COMMENT '宽度(cm)',
  height DECIMAL(8, 2) COMMENT '高度(cm)',
  full_description LONGTEXT COMMENT '完整描述',
  highlights LONGTEXT COMMENT '卖点列表',
  care_guide TEXT COMMENT '护理指南',
  warranty TEXT COMMENT '保修信息',
  seo_keywords VARCHAR(500) COMMENT 'SEO关键词',
  seo_description VARCHAR(500) COMMENT 'SEO描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品详情表';

-- 8. 商品评价表
CREATE TABLE IF NOT EXISTS product_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '评价ID',
  product_id INT NOT NULL COMMENT '商品ID',
  user_id INT NOT NULL COMMENT '用户ID',
  order_item_id INT COMMENT '订单项ID',
  rating TINYINT NOT NULL COMMENT '评分(1-5)',
  comment TEXT COMMENT '评价内容',
  review_images LONGTEXT COMMENT '评价图片',
  helpful_count INT DEFAULT 0 COMMENT '有用数',
  unhelpful_count INT DEFAULT 0 COMMENT '没用数',
  is_verified_purchase TINYINT(1) DEFAULT 1 COMMENT '是否已购认证',
  is_approved TINYINT(1) DEFAULT 1 COMMENT '是否通过审核',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  KEY idx_product_rating (product_id, rating),
  KEY idx_user (user_id),
  KEY idx_approved (is_approved, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品评价表';

-- 9. 商品标签表
CREATE TABLE IF NOT EXISTS product_tags (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '标签ID',
  product_id INT NOT NULL COMMENT '商品ID',
  tag_name VARCHAR(50) NOT NULL COMMENT '标签名',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uk_product_tag (product_id, tag_name),
  KEY idx_tag (tag_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品标签表';

-- 10. 购物车表
CREATE TABLE IF NOT EXISTS cart_items (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '购物车项ID',
  user_id INT NOT NULL COMMENT '用户ID',
  product_id INT NOT NULL COMMENT '商品ID',
  quantity INT NOT NULL DEFAULT 1 COMMENT '购买数量',
  selected_attributes JSON COMMENT '选中属性',
  selected_color_id VARCHAR(100) COMMENT '选中颜色',
  selected_size_id VARCHAR(100) COMMENT '选中尺码',
  cart_price INT COMMENT '加入时的价格',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_product (user_id, product_id),
  KEY idx_user (user_id),
  KEY idx_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';

-- 11. 订单表
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
  order_no VARCHAR(100) NOT NULL UNIQUE COMMENT '订单号',
  user_id INT NOT NULL COMMENT '用户ID',
  subtotal INT NOT NULL COMMENT '小计',
  shipping_cost INT DEFAULT 0 COMMENT '运费',
  discount_amount INT DEFAULT 0 COMMENT '折扣金额',
  total_amount INT NOT NULL COMMENT '总金额',
  status ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded')
         DEFAULT 'pending' COMMENT '订单状态',
  payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid' COMMENT '支付状态',
  shipping_address TEXT COMMENT '收货地址',
  receiver_name VARCHAR(100) COMMENT '收货人姓名',
  receiver_phone VARCHAR(20) COMMENT '收货人电话',
  notes TEXT COMMENT '订单备注',
  paid_at TIMESTAMP NULL COMMENT '支付时间',
  shipped_at TIMESTAMP NULL COMMENT '发货时间',
  delivered_at TIMESTAMP NULL COMMENT '收货时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_user (user_id),
  KEY idx_order_no (order_no),
  KEY idx_status (status),
  KEY idx_created (created_at),
  UNIQUE KEY uk_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 12. 订单商品表
CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '订单项ID',
  order_id INT NOT NULL COMMENT '订单ID',
  product_id INT NOT NULL COMMENT '商品ID',
  quantity INT NOT NULL COMMENT '购买数量',
  selected_attributes JSON COMMENT '选中属性',
  product_name VARCHAR(200) NOT NULL COMMENT '商品名称',
  sku VARCHAR(100) COMMENT '商品SKU',
  price_snapshot INT NOT NULL COMMENT '订单时的价格',
  subtotal INT NOT NULL COMMENT '小计',
  status ENUM('pending', 'shipped', 'delivered', 'returned', 'refunded') DEFAULT 'pending' COMMENT '项目状态',
  refundable TINYINT(1) DEFAULT 1 COMMENT '是否可退款',
  refund_reason TEXT COMMENT '退款原因',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  KEY idx_order (order_id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单商品表';

-- 13. 退款表
CREATE TABLE IF NOT EXISTS order_refunds (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '退款ID',
  refund_no VARCHAR(100) NOT NULL UNIQUE COMMENT '退款号',
  order_item_id INT NOT NULL COMMENT '订单项ID',
  refund_amount INT NOT NULL COMMENT '退款金额',
  status ENUM('pending', 'approved', 'processing', 'completed', 'rejected') DEFAULT 'pending' COMMENT '退款状态',
  refund_reason VARCHAR(500) COMMENT '退款原因',
  refund_description TEXT COMMENT '退款描述',
  return_tracking_no VARCHAR(100) COMMENT '退货单号',
  return_received_at TIMESTAMP NULL COMMENT '收到退货时间',
  processed_by INT COMMENT '处理人ID',
  processed_notes TEXT COMMENT '处理备注',
  processed_at TIMESTAMP NULL COMMENT '处理时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  UNIQUE KEY uk_refund_no (refund_no),
  KEY idx_status (status),
  KEY idx_order_item (order_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='退款表';
```

---

## 表关系图

### 实体关系图 (ER图)

```
┌─────────────┐
│ categories  │
│─────────────│
│ id (PK)     │
│ name        │
│ slug        │
│ parent_id   │──┐
└─────────────┘  │ (自关联)
       ▲         │
       │ (1:N)   │
       │         │
┌──────┴────────────────────────────────┐
│           products                     │
│──────────────────────────────────────  │
│ id (PK)                                │
│ category_id (FK) ────────────────┐    │
│ sku                              │    │
│ name, description                │    │
│ status flags                     │    │
│ stock_quantity                   │    │
└──────────────────────────────────────┘
   │
   ├─→ product_prices (1:1)
   │   ├─ original_price
   │   ├─ current_price
   │   └─ discount_rate
   │
   ├─→ product_images (1:N)
   │   ├─ image_url
   │   ├─ image_type
   │   └─ sort_order
   │
   ├─→ product_stats (1:1)
   │   ├─ sales_count
   │   ├─ views_count
   │   ├─ average_rating
   │   └─ reviews_count
   │
   ├─→ product_attributes (1:N)
   │   ├─ attribute_name (color, size)
   │   ├─ attribute_value
   │   └─ stock_quantity
   │
   ├─→ product_details (1:1)
   │   ├─ brand, material, origin
   │   ├─ full_description
   │   └─ seo_keywords
   │
   ├─→ product_reviews (1:N)
   │   ├─ rating
   │   ├─ comment
   │   └─ user_id
   │
   └─→ product_tags (1:N)
       └─ tag_name (new, hot, limited)

┌─────────────────────────────────────┐
│        cart_items                   │
│─────────────────────────────────────│
│ id, user_id, product_id (FK)       │
│ quantity, selected_attributes      │
└─────────────────────────────────────┘

┌──────────────────────────────────────────┐
│              orders                      │
│──────────────────────────────────────────│
│ id (PK), order_no (UNIQUE)              │
│ user_id                                 │
│ total_amount, status                    │
│ shipping_address                        │
└──────────────────────────────────────────┘
   │
   └─→ order_items (1:N)
       ├─ order_id (FK)
       ├─ product_id (FK)
       ├─ quantity
       ├─ price_snapshot
       └─ status
           │
           └─→ order_refunds (1:N)
               ├─ refund_no
               ├─ refund_amount
               └─ status
```

---

## 索引策略

### 1. 查询性能索引

```sql
-- 分类页面: 按分类查询商品
ALTER TABLE products ADD KEY idx_category_sale (category_id, is_sale_on, created_at);

-- 热销排序: 按销量排序
ALTER TABLE product_stats ADD KEY idx_sales_desc (sales_count DESC);

-- 价格排序: 按价格排序
ALTER TABLE product_prices ADD KEY idx_price_range (current_price, original_price);

-- 评分排序: 按评分排序
ALTER TABLE product_stats ADD KEY idx_rating_desc (average_rating DESC, reviews_count DESC);

-- 新品: 新品标签
ALTER TABLE products ADD KEY idx_new_created (is_new, created_at DESC);

-- 搜索: 全文搜索
ALTER TABLE products ADD FULLTEXT KEY ft_search (name, description);
```

### 2. 购物车性能索引

```sql
-- 用户购物车查询
ALTER TABLE cart_items ADD KEY idx_user_updated (user_id, updated_at DESC);
```

### 3. 订单性能索引

```sql
-- 用户订单查询
ALTER TABLE orders ADD KEY idx_user_created (user_id, created_at DESC);

-- 订单状态统计
ALTER TABLE orders ADD KEY idx_status_created (status, created_at DESC);

-- 订单项查询
ALTER TABLE order_items ADD KEY idx_order_status (order_id, status);
```

### 4. 评价性能索引

```sql
-- 商品评价列表
ALTER TABLE product_reviews ADD KEY idx_product_created (product_id, created_at DESC);

-- 已认证购买评价优先
ALTER TABLE product_reviews ADD KEY idx_verified_approved (is_verified_purchase, is_approved, created_at DESC);
```

### 索引总结

| 表名 | 索引名 | 字段 | 用途 |
|------|--------|------|------|
| products | idx_category_sale | category_id, is_sale_on, created_at | 分类页面展示 |
| product_prices | idx_current_price | current_price | 价格排序 |
| product_stats | idx_sales | sales_count | 热销排序 |
| product_stats | idx_rating | average_rating, reviews_count | 评分排序 |
| product_reviews | idx_product_created | product_id, created_at | 评价列表 |
| orders | idx_user_created | user_id, created_at | 用户订单 |
| cart_items | idx_user_updated | user_id, updated_at | 购物车查询 |

---

## 查询优化

### 常见查询场景

#### 1. 分类页面 - 获取商品列表

```sql
-- 场景: 分类页面，显示10个商品，包含价格、统计、图片
SELECT
  p.id, p.name, p.sku,
  pp.original_price, pp.current_price, pp.discount_rate,
  pi.image_url,
  ps.sales_count, ps.average_rating, ps.reviews_count,
  CASE
    WHEN p.is_new THEN 'new'
    WHEN ps.sales_count > 1000 THEN 'hot'
    ELSE NULL
  END as badge
FROM products p
LEFT JOIN product_prices pp ON p.id = pp.product_id
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.image_type = 'cover'
LEFT JOIN product_stats ps ON p.id = ps.product_id
WHERE p.category_id = 1
  AND p.is_sale_on = 1
  AND p.is_out_of_stock = 0
ORDER BY ps.sales_count DESC
LIMIT 10;

-- 执行计划: 应使用 idx_category_sale 索引
```

#### 2. 详情页面 - 获取完整商品信息

```sql
-- 场景: 详情页面，获取商品的所有信息
SELECT p.*,
  pp.original_price, pp.current_price, pp.discount_rate,
  GROUP_CONCAT(DISTINCT pi.image_url) as images,
  ps.sales_count, ps.average_rating,
  pd.brand, pd.material, pd.full_description,
  GROUP_CONCAT(DISTINCT pa.attribute_value) as attributes
FROM products p
LEFT JOIN product_prices pp ON p.id = pp.product_id
LEFT JOIN product_images pi ON p.id = pi.product_id
LEFT JOIN product_stats ps ON p.id = ps.product_id
LEFT JOIN product_details pd ON p.id = pd.product_id
LEFT JOIN product_attributes pa ON p.id = pa.product_id
WHERE p.id = 123
GROUP BY p.id;

-- 注意: 注意 GROUP_CONCAT 的限制，可能需要调整 group_concat_max_len
```

#### 3. 搜索 - 全文搜索商品

```sql
-- 场景: 搜索框输入关键词，查找相关商品
SELECT p.id, p.name, p.sku,
  MATCH(p.name, p.description) AGAINST('皮包' IN BOOLEAN MODE) as relevance,
  pp.current_price,
  pi.image_url
FROM products p
LEFT JOIN product_prices pp ON p.id = pp.product_id
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.image_type = 'cover'
WHERE MATCH(p.name, p.description) AGAINST('皮包' IN BOOLEAN MODE)
  AND p.is_sale_on = 1
ORDER BY relevance DESC, p.id DESC
LIMIT 20;

-- 执行计划: 使用 FULLTEXT 索引进行全文搜索
```

#### 4. 购物车 - 获取购物车商品

```sql
-- 场景: 购物车页面，获取用户的购物车商品
SELECT
  ci.id, ci.user_id, ci.product_id,
  ci.quantity,
  p.name, p.sku,
  pp.current_price,
  pi.image_url,
  ps.stock_quantity,
  ci.selected_attributes
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
LEFT JOIN product_prices pp ON p.id = pp.product_id
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.image_type = 'thumb'
LEFT JOIN product_stats ps ON p.id = ps.product_id
WHERE ci.user_id = 456
ORDER BY ci.updated_at DESC;

-- 执行计划: 使用 idx_user_updated 索引快速查询用户购物车
```

#### 5. 订单 - 获取用户订单列表

```sql
-- 场景: 用户订单列表页面
SELECT
  o.id, o.order_no, o.total_amount, o.status,
  o.created_at,
  COUNT(oi.id) as item_count,
  GROUP_CONCAT(CONCAT(oi.product_name, '(', oi.quantity, ')')) as items_summary
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = 789
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT 10;

-- 执行计划: 使用 idx_user_created 索引
```

#### 6. 评价 - 商品评价列表

```sql
-- 场景: 详情页评价列表，展示已验证购买的评价
SELECT
  pr.id, pr.user_id, pr.rating, pr.comment,
  pr.helpful_count, pr.unhelpful_count,
  pr.created_at
FROM product_reviews pr
WHERE pr.product_id = 123
  AND pr.is_verified_purchase = 1
  AND pr.is_approved = 1
ORDER BY
  CASE WHEN pr.helpful_count > 50 THEN 1 ELSE 2 END,
  pr.created_at DESC
LIMIT 20;

-- 执行计划: 使用 idx_verified_approved 索引
```

### 查询优化建议

1. **使用 EXPLAIN**: 总是用 EXPLAIN 检查查询计划
   ```sql
   EXPLAIN SELECT ...;
   ```

2. **避免 SELECT ***: 只查询需要的字段，减少 I/O

3. **合理使用 JOIN**: 避免过多表的 JOIN，考虑分离查询

4. **分页查询**: 大数据量时使用 LIMIT + OFFSET 或 范围查询
   ```sql
   -- 不推荐
   SELECT * FROM products LIMIT 100000, 10;

   -- 推荐
   SELECT * FROM products WHERE id > 100000 LIMIT 10;
   ```

5. **缓存统计数据**: product_stats 是缓存数据，定期更新
   ```sql
   -- 每小时更新一次
   UPDATE product_stats ps
   SET ps.sales_count = (
     SELECT COUNT(*) FROM order_items
     WHERE product_id = ps.product_id
   )
   WHERE ps.id > 0;
   ```

---

## 示例数据

### 插入示例数据脚本

```sql
-- ============================================
-- 示例数据插入脚本
-- ============================================

-- 1. 插入分类
INSERT INTO categories (name, slug, description, sort_order) VALUES
('手袋', 'bags', '优雅的手袋系列', 1),
('钱包', 'wallets', '精美的钱包设计', 2),
('背包', 'backpacks', '实用的背包收藏', 3),
('配件', 'accessories', '时尚配饰', 4);

SET @bag_category = LAST_INSERT_ID() - 3;

-- 2. 插入商品
INSERT INTO products (
  name, sku, description, category_id,
  is_new, is_sale_on, stock_quantity, low_stock_threshold
) VALUES
(
  '经典皮质手袋',
  'BAG-001',
  '高端皮革手工打造的经典款式',
  @bag_category,
  0, 1, 50, 10
),
(
  '迷你肩包',
  'BAG-002',
  '小巧精致，日常出街必备',
  @bag_category,
  1, 1, 25, 5
),
(
  '商务公文包',
  'BAG-003',
  '专业商务范儿',
  @bag_category,
  0, 1, 15, 3
);

SET @product_1 = LAST_INSERT_ID() - 2;
SET @product_2 = LAST_INSERT_ID() - 1;
SET @product_3 = LAST_INSERT_ID();

-- 3. 插入价格信息
INSERT INTO product_prices (product_id, original_price, current_price, discount_rate, currency) VALUES
(@product_1, 128000, 99800, 78, 'CNY'),
(@product_2, 68000, 55800, 82, 'CNY'),
(@product_3, 158000, 128000, 81, 'CNY');

-- 4. 插入商品图片
INSERT INTO product_images (product_id, image_url, image_type, alt_text, sort_order) VALUES
(@product_1, 'https://images.example.com/bag1-thumb.jpg', 'thumb', '经典皮质手袋缩略图', 1),
(@product_1, 'https://images.example.com/bag1-cover.jpg', 'cover', '经典皮质手袋', 1),
(@product_1, 'https://images.example.com/bag1-detail-1.jpg', 'detail', '经典皮质手袋详情1', 1),
(@product_1, 'https://images.example.com/bag1-detail-2.jpg', 'detail', '经典皮质手袋详情2', 2),
(@product_2, 'https://images.example.com/bag2-thumb.jpg', 'thumb', '迷你肩包缩略图', 1),
(@product_2, 'https://images.example.com/bag2-cover.jpg', 'cover', '迷你肩包', 1);

-- 5. 插入统计数据
INSERT INTO product_stats (product_id, sales_count, views_count, average_rating, reviews_count, favorites_count) VALUES
(@product_1, 2850, 15000, 4.8, 342, 1200),
(@product_2, 1250, 8500, 4.6, 185, 680),
(@product_3, 560, 4200, 4.9, 95, 320);

-- 6. 插入商品属性 (颜色)
INSERT INTO product_attributes (product_id, attribute_name, attribute_value, color_hex, stock_quantity) VALUES
(@product_1, 'color', '黑色', '#000000', 20),
(@product_1, 'color', '棕色', '#8B4513', 15),
(@product_1, 'color', '红色', '#FF0000', 15),
(@product_2, 'color', '黑色', '#000000', 15),
(@product_2, 'color', '米色', '#F5E6D3', 10);

-- 7. 插入商品属性 (尺码)
INSERT INTO product_attributes (product_id, attribute_name, attribute_value, size_sort_order, stock_quantity) VALUES
(@product_1, 'size', 'S', 1, 15),
(@product_1, 'size', 'M', 2, 20),
(@product_1, 'size', 'L', 3, 15),
(@product_2, 'size', 'OneSize', 1, 25);

-- 8. 插入商品详情
INSERT INTO product_details (
  product_id, brand, material, origin,
  full_description, care_guide, warranty
) VALUES
(
  @product_1,
  '瑞竹皮具',
  '意大利进口牛皮',
  '意大利',
  '<h2>经典皮质手袋</h2><p>采用意大利进口牛皮，手工打造而成。每一件都是艺术品。</p>',
  '定期清洁，远离水分和阳光',
  '保修12个月'
);

-- 9. 插入商品标签
INSERT INTO product_tags (product_id, tag_name) VALUES
(@product_1, 'hot'),
(@product_2, 'new'),
(@product_2, 'discount');
```

### 查询示例数据

```sql
-- 查询商品列表（模拟分类页面）
SELECT
  p.id, p.name, p.sku,
  pp.original_price, pp.current_price, pp.discount_rate,
  (SELECT image_url FROM product_images WHERE product_id = p.id AND image_type = 'cover' LIMIT 1) as cover_image,
  ps.sales_count, ps.average_rating,
  GROUP_CONCAT(DISTINCT pt.tag_name) as tags
FROM products p
LEFT JOIN product_prices pp ON p.id = pp.product_id
LEFT JOIN product_stats ps ON p.id = ps.product_id
LEFT JOIN product_tags pt ON p.id = pt.product_id
WHERE p.is_sale_on = 1 AND p.is_out_of_stock = 0
GROUP BY p.id
ORDER BY ps.sales_count DESC;
```

---

## 迁移指南

### 分阶段迁移计划

#### 第 1 阶段：数据库创建 (1 天)

- [ ] 创建数据库: `CREATE DATABASE ruizhu_ecommerce;`
- [ ] 运行完整建表脚本
- [ ] 验证所有表创建成功
- [ ] 创建索引

```bash
# 导入SQL脚本
mysql -u root -p ruizhu_ecommerce < database_schema.sql
```

#### 第 2 阶段：迁移现有数据 (2-3 天)

- [ ] 从旧系统导出商品数据
- [ ] 数据清洗和验证
- [ ] 批量导入到新表
- [ ] 验证数据完整性

```sql
-- 示例: 从旧表迁移数据
INSERT INTO products (id, name, sku, description, category_id, stock_quantity, created_at)
SELECT id, name, CONCAT('SKU-', id), description, category_id, stock, NOW()
FROM old_products;
```

#### 第 3 阶段：创建 API 接口 (3-5 天)

- [ ] 创建 NestJS 服务层
- [ ] 实现商品列表、详情、搜索接口
- [ ] 实现购物车接口
- [ ] 实现订单接口

#### 第 4 阶段：前端集成 (3-5 天)

- [ ] 更新小程序商品列表页面
- [ ] 更新商品详情页面
- [ ] 更新购物车页面
- [ ] 完整测试

#### 第 5 阶段：性能优化 (2-3 天)

- [ ] 添加缓存策略
- [ ] 优化慢查询
- [ ] 压力测试
- [ ] 上线

### 数据校验脚本

```sql
-- 检查数据完整性
-- 1. 检查是否有孤立的订单商品
SELECT oi.* FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.id IS NULL;

-- 2. 检查是否有孤立的购物车项
SELECT ci.* FROM cart_items ci
LEFT JOIN products p ON ci.product_id = p.id
WHERE p.id IS NULL;

-- 3. 检查统计数据与实际数据的差异
SELECT
  ps.product_id,
  ps.sales_count as stats_sales,
  COUNT(oi.id) as actual_sales
FROM product_stats ps
LEFT JOIN order_items oi ON ps.product_id = oi.product_id
GROUP BY ps.product_id
HAVING stats_sales != actual_sales;

-- 4. 检查价格数据
SELECT p.id, p.name, pp.original_price, pp.current_price
FROM products p
LEFT JOIN product_prices pp ON p.id = pp.product_id
WHERE pp.id IS NULL;
```

### 备份和恢复

```bash
# 数据库备份
mysqldump -u root -p ruizhu_ecommerce > backup_$(date +%Y%m%d).sql

# 数据库恢复
mysql -u root -p ruizhu_ecommerce < backup_20241028.sql
```

---

## 总结

### 核心设计点

| 方面 | 设计特点 |
|------|---------|
| **规范化** | 第三范式，避免数据重复和异常 |
| **性能** | 合理索引，支持快速查询和排序 |
| **可扩展性** | 属性表支持灵活的商品属性 |
| **完整性** | 支持完整的电商流程（商品→购物车→订单→退款） |
| **安全性** | 外键约束确保引用完整性 |
| **易维护性** | 清晰的表结构和命名约定 |

### 立即行动

1. **复制SQL建表脚本** (5 分钟)
   - 文件: `nestapi/src/database/schema.sql`

2. **配置数据库连接** (10 分钟)
   - 在 NestJS 配置中连接数据库

3. **创建 TypeORM 实体** (2-3 小时)
   - 为每个表创建对应的 Entity 类

4. **实现数据服务层** (1-2 天)
   - 创建 Repository 和 Service

5. **编写 API 接口** (2-3 天)
   - RESTful API 端点

---

**数据库设计完成！**
**预期收益**: 完整的数据模型、优化的查询性能、清晰的架构
