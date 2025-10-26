# Ruizhu 平台 - 数据库设计文档

## 概述
基于小程序功能需求，设计的完整电商数据库架构，支持产品管理、购物车、订单、支付等核心功能。

---

## 核心实体关系图

```
用户 (User)
├── 订单 (Order) 1:N
│   └── 订单项 (OrderItem) 1:N → 产品 (Product)
├── 购物车 (Cart) 1:1
│   └── 购物车项 (CartItem) 1:N → 产品 (Product)
├── 愿望清单 (Wishlist) 1:1
│   └── 愿望清单项 (WishlistItem) 1:N → 产品 (Product)
├── 地址 (Address) 1:N
└── 支付 (Payment) 1:N

产品 (Product)
├── 分类 (Category) N:1
├── 产品图片 (ProductImage) 1:N
├── 产品变体 (ProductVariant) 1:N
├── 订单项 (OrderItem) N:N
├── 购物车项 (CartItem) N:N
└── 合集 (Collection) N:N

优惠券 (Coupon) - 独立表
支付 (Payment) - 订单相关

```

---

## 数据表详细说明

### 1. 产品相关表

#### categories（产品分类）
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,          -- 分类名称：服装、珠宝、鞋类、香水
  description TEXT,                           -- 描述
  icon VARCHAR(500),                          -- 分类图标URL
  displayOrder INT DEFAULT 0,                 -- 显示顺序
  isActive BOOLEAN DEFAULT true,              -- 是否激活
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### products（产品）
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) UNIQUE NOT NULL,          -- 产品名称
  sku VARCHAR(100) UNIQUE NOT NULL,           -- SKU编码
  description TEXT,                           -- 详细描述
  shortDescription TEXT,                      -- 简短描述
  categoryId INT NOT NULL,                    -- 所属分类
  price DECIMAL(10,2) NOT NULL,               -- 现价
  originalPrice DECIMAL(10,2),                -- 原价
  stock INT DEFAULT 0,                        -- 库存
  sales INT DEFAULT 0,                        -- 销售量
  status VARCHAR(20) DEFAULT 'active',        -- 状态：draft/active/inactive/out_of_stock
  rating FLOAT DEFAULT 0,                     -- 评分
  reviewCount INT DEFAULT 0,                  -- 评价数
  isFeatured BOOLEAN DEFAULT false,           -- 是否精选
  displayOrder INT DEFAULT 0,                 -- 显示顺序
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES categories(id)
);
```

#### product_images（产品图片）
```sql
CREATE TABLE product_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  productId INT NOT NULL,
  imageUrl TEXT NOT NULL,                     -- 图片URL
  displayOrder INT DEFAULT 0,                 -- 显示顺序
  isThumbnail BOOLEAN DEFAULT false,          -- 是否缩略图
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);
```

#### product_variants（产品变体：颜色、尺寸等）
```sql
CREATE TABLE product_variants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  productId INT NOT NULL,
  name VARCHAR(100) NOT NULL,                 -- 变体名称，如："红色 XL"
  color VARCHAR(50),                          -- 颜色：红、黑、白等
  size VARCHAR(50),                           -- 尺寸：S/M/L/XL
  priceAdjustment DECIMAL(10,2),              -- 价格调整
  variantSku VARCHAR(100) UNIQUE,             -- 变体SKU
  stock INT DEFAULT 0,                        -- 变体库存
  isActive BOOLEAN DEFAULT true,              -- 是否激活
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);
```

### 2. 购物车相关表

#### carts（购物车）
```sql
CREATE TABLE carts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL UNIQUE,                 -- 用户ID
  totalItems INT DEFAULT 0,                   -- 总商品数
  totalPrice DECIMAL(10,2) DEFAULT 0,         -- 总价
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

#### cart_items（购物车项）
```sql
CREATE TABLE cart_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cartId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT DEFAULT 1,                     -- 购买数量
  selectedColor VARCHAR(50),                  -- 选中的颜色
  selectedSize VARCHAR(50),                   -- 选中的尺寸
  price DECIMAL(10,2) NOT NULL,               -- 当前价格
  isSelected BOOLEAN DEFAULT true,            -- 是否被选中（用于批量操作）
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cartId) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id),
  UNIQUE KEY (cartId, productId, selectedColor, selectedSize)
);
```

### 3. 订单相关表

#### orders（订单）
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  addressId INT,                              -- 收货地址
  phone VARCHAR(20),                          -- 收货电话
  totalPrice DECIMAL(10,2) NOT NULL,          -- 订单总额
  status VARCHAR(20) DEFAULT 'pending',       -- 状态：pending/confirmed/shipped/delivered/cancelled
  remark TEXT,                                -- 备注
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (addressId) REFERENCES addresses(id)
);
```

#### order_items（订单项）
```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,
  productId INT NOT NULL,
  productName VARCHAR(255) NOT NULL,         -- 订单快照：产品名称
  productSku VARCHAR(100),                   -- 订单快照：SKU
  quantity INT NOT NULL,
  unitPrice DECIMAL(10,2) NOT NULL,          -- 单价快照
  totalPrice DECIMAL(10,2) NOT NULL,         -- 小计
  selectedColor VARCHAR(50),
  selectedSize VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id)
);
```

### 4. 用户相关表

#### users（用户）- 已存在，扩展字段
```sql
-- 微信相关字段已在users表中：
-- openid, sessionKey, wechatNickname, avatar, unionid
```

#### addresses（地址）- 已存在
```sql
-- 用于订单配送地址
```

### 5. 愿望清单表

#### wishlists（愿望清单）
```sql
CREATE TABLE wishlists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL UNIQUE,                 -- 每个用户一个愿望清单
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

#### wishlist_items（愿望清单项）
```sql
CREATE TABLE wishlist_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  wishlistId INT NOT NULL,
  productId INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wishlistId) REFERENCES wishlists(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id),
  UNIQUE KEY (wishlistId, productId)
);
```

### 6. 优惠券表

#### coupons（优惠券）
```sql
CREATE TABLE coupons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(100) UNIQUE NOT NULL,          -- 优惠券代码
  description TEXT,
  type VARCHAR(20) DEFAULT 'fixed',           -- 类型：fixed/percentage/free_shipping
  discount DECIMAL(10,2) NOT NULL,            -- 优惠金额或百分比
  minOrderAmount DECIMAL(10,2) DEFAULT 0,     -- 最低订单金额
  maxDiscount DECIMAL(10,2),                  -- 最大优惠金额
  usageLimit INT DEFAULT 999999,              -- 使用次数限制
  usageCount INT DEFAULT 0,                   -- 已使用次数
  usagePerUser INT DEFAULT 1,                 -- 每个用户最多使用次数
  validFrom DATETIME NOT NULL,                -- 开始时间
  validUntil DATETIME NOT NULL,               -- 结束时间
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. 合集表

#### collections（产品合集）
```sql
CREATE TABLE collections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) UNIQUE NOT NULL,          -- 合集名称
  description TEXT,
  coverImage VARCHAR(500),                    -- 封面图
  bannerImage TEXT,                           -- 横幅图
  displayOrder INT DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### collection_products（合集-产品关联）
```sql
CREATE TABLE collection_products (
  collectionId INT NOT NULL,
  productId INT NOT NULL,
  PRIMARY KEY (collectionId, productId),
  FOREIGN KEY (collectionId) REFERENCES collections(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);
```

---

## 核心业务流程

### 1. 产品浏览流程
```
GET /api/v1/categories              → 获取所有分类
GET /api/v1/products?category=1     → 按分类获取产品
GET /api/v1/products/:id            → 获取产品详情（包含images、variants）
GET /api/v1/collections             → 获取合集列表
```

### 2. 购物车流程
```
POST /api/v1/cart/add               → 添加到购物车
GET /api/v1/cart                    → 获取购物车内容
PATCH /api/v1/cart/items/:id        → 更新购物车项（数量、选中状态）
DELETE /api/v1/cart/items/:id       → 删除购物车项
```

### 3. 订单创建流程
```
POST /api/v1/orders                 → 创建订单（从购物车）
GET /api/v1/orders                  → 获取用户订单列表
GET /api/v1/orders/:id              → 获取订单详情
```

### 4. 愿望清单流程
```
POST /api/v1/wishlist/add           → 添加到愿望清单
GET /api/v1/wishlist                → 获取愿望清单
DELETE /api/v1/wishlist/:id         → 从愿望清单删除
```

### 5. 优惠券流程
```
POST /api/v1/orders/validate-coupon → 验证优惠券
POST /api/v1/orders                 → 创建订单时应用优惠券
```

---

## 索引策略

```sql
-- 产品相关
CREATE INDEX idx_products_category ON products(categoryId);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(isFeatured);
CREATE INDEX idx_product_images_product ON product_images(productId);
CREATE INDEX idx_product_variants_product ON product_variants(productId);

-- 购物车相关
CREATE INDEX idx_cart_user ON carts(userId);
CREATE INDEX idx_cart_items_cart ON cart_items(cartId);
CREATE INDEX idx_cart_items_product ON cart_items(productId);

-- 订单相关
CREATE INDEX idx_orders_user ON orders(userId);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(orderId);
CREATE INDEX idx_order_items_product ON order_items(productId);

-- 用户相关
CREATE INDEX idx_wishlist_user ON wishlists(userId);
CREATE INDEX idx_wishlist_items_wishlist ON wishlist_items(wishlistId);
CREATE INDEX idx_wishlist_items_product ON wishlist_items(productId);

-- 优惠券
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(isActive);
```

---

## 数据一致性保证

1. **库存管理**
   - 下单时检查product_variants或products库存
   - 订单创建成功时扣减库存
   - 订单取消时恢复库存

2. **购物车与订单**
   - 创建订单时，将购物车项转换为订单项
   - 订单创建后可清空购物车（选中的项）

3. **价格快照**
   - OrderItem保存订单创建时的价格快照
   - 防止产品价格变化对历史订单的影响

4. **级联删除**
   - 删除购物车自动删除购物车项
   - 删除订单自动删除订单项
   - 删除产品自动删除关联的图片和变体

---

## 未来扩展

1. **评价系统** - ProductReview表
2. **库存日志** - InventoryLog表用于审计
3. **用户优惠券** - UserCoupon表用于关联用户与优惠券使用记录
4. **推荐系统** - ProductRecommendation表
5. **浏览历史** - ViewHistory表用于个性化推荐

---

## 创建实体的文件位置

✅ nestapi/src/products/entities/
  - product.entity.ts
  - product-image.entity.ts
  - product-variant.entity.ts

✅ nestapi/src/categories/entities/
  - category.entity.ts

✅ nestapi/src/carts/entities/
  - cart.entity.ts
  - cart-item.entity.ts

✅ nestapi/src/wishlists/entities/
  - wishlist.entity.ts
  - wishlist-item.entity.ts

✅ nestapi/src/coupons/entities/
  - coupon.entity.ts

✅ nestapi/src/collections/entities/
  - collection.entity.ts

✅ nestapi/src/orders/entities/
  - order-item.entity.ts (已存在order.entity.ts)

---

## 下一步

1. ✅ 创建所有Entity类
2. ⏳ 在NestJS模块中导入这些Entity
3. ⏳ 生成TypeORM迁移文件
4. ⏳ 开发CRUD Service和Controller
5. ⏳ 实现复杂业务逻辑（订单、支付、库存）
6. ⏳ 创建管理后台UI
