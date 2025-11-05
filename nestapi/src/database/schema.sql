-- ============================================
-- 睿珠电商平台 - 数据库完整建表脚本
-- ============================================
-- 创建时间: 2024-10-28
-- 版本: 1.0.0
-- 说明: 包含所有表的定义和索引

-- 数据库选择
USE mydb;

-- ============================================
-- 1. 分类表 (categories)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
  name VARCHAR(100) NOT NULL UNIQUE COMMENT '分类名称: 手袋, 钱包, 背包, 配件',
  slug VARCHAR(100) NOT NULL UNIQUE COMMENT 'URL slug: bags, wallets, backpacks',
  description VARCHAR(500) COMMENT '分类描述',
  icon_url VARCHAR(255) COMMENT '分类图标URL',
  sort_order INT DEFAULT 0 COMMENT '排序权重(越小越靠前)',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  parent_id INT COMMENT '父分类ID(支持二级分类)',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  UNIQUE KEY uk_slug (slug),
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  KEY idx_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

-- ============================================
-- 2. 商品表 (products)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
  name VARCHAR(200) NOT NULL COMMENT '商品名称(大标题)',
  subtitle VARCHAR(200) COMMENT '商品副标题(小标题)',
  sku VARCHAR(100) NOT NULL UNIQUE COMMENT '商品SKU(库存单位)',
  description TEXT COMMENT '商品简述',
  category_id INT NOT NULL COMMENT '分类ID',

  -- 商品状态
  is_new TINYINT(1) DEFAULT 0 COMMENT '是否新品',
  is_sale_on TINYINT(1) DEFAULT 1 COMMENT '是否上架',
  is_out_of_stock TINYINT(1) DEFAULT 0 COMMENT '是否缺货',
  is_sold_out TINYINT(1) DEFAULT 0 COMMENT '是否售罄',
  is_vip_only TINYINT(1) DEFAULT 0 COMMENT '是否VIP专属',

  -- 库存管理
  stock_quantity INT DEFAULT 0 COMMENT '库存数量',
  low_stock_threshold INT DEFAULT 10 COMMENT '库存预警阈值',

  -- 物流信息
  weight INT COMMENT '重量(克)',
  shipping_template_id INT COMMENT '运费模板ID',
  free_shipping_threshold DECIMAL(10, 2) COMMENT '免运费额度(元)',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  UNIQUE KEY uk_sku (sku),
  KEY idx_category (category_id),
  KEY idx_sale_status (is_sale_on, is_out_of_stock),
  KEY idx_created_at (created_at),
  FULLTEXT KEY ft_name_desc (name, description) COMMENT '全文搜索索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- ============================================
-- 3. 商品价格表 (product_prices)
-- ============================================
CREATE TABLE IF NOT EXISTS product_prices (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '价格ID',
  product_id INT NOT NULL UNIQUE COMMENT '商品ID',

  original_price INT NOT NULL COMMENT '原价(分为单位: 12800 = 128.00元)',
  current_price INT NOT NULL COMMENT '现价(分为单位)',
  discount_rate TINYINT DEFAULT 100 COMMENT '折扣率(0-100): 78表示78折',
  currency CHAR(3) DEFAULT 'CNY' COMMENT '货币类型: CNY/USD',

  -- VIP相关
  vip_discount_rate TINYINT COMMENT 'VIP折扣率',

  price_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '价格更新时间',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  KEY idx_product (product_id),
  KEY idx_current_price (current_price) COMMENT '用于价格排序'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品价格表';

-- ============================================
-- 4. 商品图片表 (product_images)
-- ============================================
CREATE TABLE IF NOT EXISTS product_images (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '图片ID',
  product_id INT NOT NULL COMMENT '商品ID',
  image_url VARCHAR(500) NOT NULL COMMENT '图片URL',
  image_type ENUM('thumb', 'cover', 'list', 'detail') DEFAULT 'cover' COMMENT '图片类型:
    thumb=缩略图200x200,
    cover=封面图400x400,
    list=列表页400x400,
    detail=详情页800x800+',

  alt_text VARCHAR(200) COMMENT '图片ALT文本(SEO用)',
  sort_order INT DEFAULT 0 COMMENT '排序(小到大)',

  width INT COMMENT '图片宽度',
  height INT COMMENT '图片高度',
  file_size INT COMMENT '文件大小(字节)',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  KEY idx_product_type (product_id, image_type),
  KEY idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品图片表';

-- ============================================
-- 5. 商品统计表 (product_stats)
-- ============================================
CREATE TABLE IF NOT EXISTS product_stats (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '统计ID',
  product_id INT NOT NULL UNIQUE COMMENT '商品ID',

  sales_count INT DEFAULT 0 COMMENT '销量(用于热销排序)',
  views_count INT DEFAULT 0 COMMENT '浏览量',
  average_rating DECIMAL(3, 2) DEFAULT 0 COMMENT '平均评分(0-5)',
  reviews_count INT DEFAULT 0 COMMENT '评价数量',
  favorites_count INT DEFAULT 0 COMMENT '收藏数',

  conversion_rate DECIMAL(5, 2) COMMENT '转化率(%)',
  last_sold_at TIMESTAMP NULL COMMENT '最后购买时间',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  KEY idx_sales (sales_count) COMMENT '热销排序',
  KEY idx_rating (average_rating) COMMENT '评分排序',
  KEY idx_favorites (favorites_count) COMMENT '收藏排序'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品统计表';

-- ============================================
-- 6. 商品属性表 (product_attributes)
-- ============================================
CREATE TABLE IF NOT EXISTS product_attributes (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '属性ID',
  product_id INT NOT NULL COMMENT '商品ID',
  attribute_name VARCHAR(50) NOT NULL COMMENT '属性名: color, size, material',
  attribute_value VARCHAR(200) NOT NULL COMMENT '属性值: 黑色, M, 皮革',

  attribute_sku_suffix VARCHAR(50) COMMENT '属性SKU后缀',
  additional_price INT DEFAULT 0 COMMENT '属性价格差(分)',
  stock_quantity INT DEFAULT 0 COMMENT '该属性的库存',

  color_hex VARCHAR(7) COMMENT '颜色十六进制值: #000000',
  size_sort_order INT COMMENT '尺码排序',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  KEY idx_product_attr (product_id, attribute_name),
  UNIQUE KEY uk_product_attr_value (product_id, attribute_name, attribute_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品属性表(颜色/尺码/材质等)';

-- ============================================
-- 7. 商品详情表 (product_details)
-- ============================================
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

  full_description LONGTEXT COMMENT '完整HTML描述',
  highlights LONGTEXT COMMENT '卖点列表(JSON数组)',
  care_guide TEXT COMMENT '护理指南',
  warranty TEXT COMMENT '保修信息',

  seo_keywords VARCHAR(500) COMMENT 'SEO关键词',
  seo_description VARCHAR(500) COMMENT 'SEO描述',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品详情表';

-- ============================================
-- 8. 商品标签表 (product_tags)
-- ============================================
CREATE TABLE IF NOT EXISTS product_tags (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '标签ID',
  product_id INT NOT NULL COMMENT '商品ID',
  tag_name VARCHAR(50) NOT NULL COMMENT '标签: new(新品), hot(热销), limited(限量), discount(打折)',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uk_product_tag (product_id, tag_name),
  KEY idx_tag (tag_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品标签表';

-- ============================================
-- 9. 购物车表 (cart_items)
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '购物车项ID',
  user_id INT NOT NULL COMMENT '用户ID',
  product_id INT NOT NULL COMMENT '商品ID',

  quantity INT NOT NULL DEFAULT 1 COMMENT '购买数量',

  selected_attributes JSON COMMENT '选中属性(JSON): {"color": "红色", "size": "M"}',
  selected_color_id VARCHAR(100) COMMENT '选中颜色ID',
  selected_size_id VARCHAR(100) COMMENT '选中尺码ID',

  cart_price INT COMMENT '加入购物车时的价格(分)',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_product (user_id, product_id),
  KEY idx_user (user_id),
  KEY idx_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';

-- ============================================
-- 10. 订单表 (orders)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
  order_no VARCHAR(100) NOT NULL UNIQUE COMMENT '订单号(用于显示)',
  user_id INT NOT NULL COMMENT '用户ID',

  subtotal INT NOT NULL COMMENT '小计(分)',
  shipping_cost INT DEFAULT 0 COMMENT '运费(分)',
  discount_amount INT DEFAULT 0 COMMENT '折扣金额(分)',
  total_amount INT NOT NULL COMMENT '总金额(分)',

  status ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded')
         DEFAULT 'pending' COMMENT '订单状态',
  payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid' COMMENT '支付状态',

  shipping_address TEXT COMMENT '收货地址(JSON)',
  receiver_name VARCHAR(100) COMMENT '收货人姓名',
  receiver_phone VARCHAR(20) COMMENT '收货人电话',

  notes TEXT COMMENT '订单备注',

  paid_at TIMESTAMP NULL COMMENT '支付时间',
  shipped_at TIMESTAMP NULL COMMENT '发货时间',
  delivered_at TIMESTAMP NULL COMMENT '收货时间',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  KEY idx_user (user_id),
  KEY idx_order_no (order_no),
  KEY idx_status (status),
  KEY idx_created (created_at),
  UNIQUE KEY uk_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- ============================================
-- 11. 订单商品表 (order_items)
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '订单项ID',
  order_id INT NOT NULL COMMENT '订单ID',
  product_id INT NOT NULL COMMENT '商品ID',

  quantity INT NOT NULL COMMENT '购买数量',
  selected_attributes JSON COMMENT '选中的属性',

  product_name VARCHAR(200) NOT NULL COMMENT '商品名称快照',
  sku VARCHAR(100) COMMENT '商品SKU',
  price_snapshot INT NOT NULL COMMENT '订单时的价格(分)',

  subtotal INT NOT NULL COMMENT '小计 = price * quantity',

  status ENUM('pending', 'shipped', 'delivered', 'returned', 'refunded') DEFAULT 'pending' COMMENT '项目状态',
  refundable TINYINT(1) DEFAULT 1 COMMENT '是否可退款',
  refund_reason TEXT COMMENT '退款原因',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  KEY idx_order (order_id),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单商品表';

-- ============================================
-- 12. 商品评价表 (product_reviews) - 移到order_items之后以满足外键依赖
-- ============================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '评价ID',
  product_id INT NOT NULL COMMENT '商品ID',
  user_id INT NOT NULL COMMENT '用户ID',
  order_item_id INT COMMENT '订单项ID(用于关联已购商品)',

  rating TINYINT NOT NULL COMMENT '评分(1-5)',
  comment TEXT COMMENT '评价内容',
  review_images LONGTEXT COMMENT '评价图片(JSON数组)',

  helpful_count INT DEFAULT 0 COMMENT '有用数',
  unhelpful_count INT DEFAULT 0 COMMENT '没用数',

  is_verified_purchase TINYINT(1) DEFAULT 1 COMMENT '是否已购认证',
  is_approved TINYINT(1) DEFAULT 1 COMMENT '是否通过审核',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL,
  KEY idx_product_rating (product_id, rating),
  KEY idx_user (user_id),
  KEY idx_approved (is_approved, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品评价表';

-- ============================================
-- 13. 退款表 (order_refunds)
-- ============================================
CREATE TABLE IF NOT EXISTS order_refunds (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '退款ID',
  refund_no VARCHAR(100) NOT NULL UNIQUE COMMENT '退款号',
  order_item_id INT NOT NULL COMMENT '订单项ID',

  refund_amount INT NOT NULL COMMENT '退款金额(分)',

  status ENUM('pending', 'approved', 'processing', 'completed', 'rejected') DEFAULT 'pending' COMMENT '退款状态',
  refund_reason VARCHAR(500) COMMENT '退款原因',
  refund_description TEXT COMMENT '退款描述',

  return_tracking_no VARCHAR(100) COMMENT '退货单号',
  return_received_at TIMESTAMP NULL COMMENT '收到退货时间',

  processed_by INT COMMENT '处理人ID',
  processed_notes TEXT COMMENT '处理备注',
  processed_at TIMESTAMP NULL COMMENT '处理时间',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
  UNIQUE KEY uk_refund_no (refund_no),
  KEY idx_status (status),
  KEY idx_order_item (order_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='退款表';

-- ============================================
-- 索引优化 - 分类页面查询
-- ============================================
CREATE INDEX idx_category_sale_status ON products(category_id, is_sale_on, is_out_of_stock, created_at DESC);

-- ============================================
-- 索引优化 - 热销排序
-- ============================================
CREATE INDEX idx_sales_desc ON product_stats(sales_count DESC);

-- ============================================
-- 索引优化 - 价格范围查询
-- ============================================
CREATE INDEX idx_price_range ON product_prices(current_price, original_price);

-- ============================================
-- 索引优化 - 评分排序
-- ============================================
CREATE INDEX idx_rating_reviews ON product_stats(average_rating DESC, reviews_count DESC);

-- ============================================
-- 索引优化 - 新品标签
-- ============================================
CREATE INDEX idx_new_created ON products(is_new, created_at DESC);

-- ============================================
-- 索引优化 - 用户订单
-- ============================================
CREATE INDEX idx_user_orders ON orders(user_id, created_at DESC);

-- ============================================
-- 索引优化 - 订单状态统计
-- ============================================
CREATE INDEX idx_order_status ON orders(status, created_at DESC);

-- ============================================
-- 索引优化 - 评价认证
-- ============================================
CREATE INDEX idx_review_verified ON product_reviews(is_verified_purchase, is_approved, created_at DESC);

-- ============================================
-- 建表完成！
-- ============================================
