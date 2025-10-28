-- ============================================
-- 瑞竹电商平台 - 初始化数据脚本
-- ============================================
-- 创建时间: 2024-10-28
-- 说明: 包含分类和示例商品数据

USE mydb;

-- ============================================
-- 第一步：清空现有数据（可选）
-- ============================================
-- DELETE FROM product_reviews;
-- DELETE FROM product_tags;
-- DELETE FROM product_images;
-- DELETE FROM product_details;
-- DELETE FROM product_attributes;
-- DELETE FROM product_stats;
-- DELETE FROM product_prices;
-- DELETE FROM products;
-- DELETE FROM categories;

-- ============================================
-- 第二步：插入分类数据
-- ============================================

INSERT INTO categories (name, slug, description, icon_url, sort_order, is_active) VALUES
(
  '服装',
  'clothing',
  '优雅的服装系列，包括连衣裙、T恤、外套等多种款式',
  'https://images.example.com/icons/clothing.png',
  1,
  1
),
(
  '珠宝',
  'jewelry',
  '精美的珠宝饰品，包括项链、手镯、耳环等高档首饰',
  'https://images.example.com/icons/jewelry.png',
  2,
  1
),
(
  '鞋履',
  'shoes',
  '舒适时尚的鞋类，包括高跟鞋、运动鞋、休闲鞋等',
  'https://images.example.com/icons/shoes.png',
  3,
  1
),
(
  '香水',
  'perfume',
  '奢华香水系列，来自世界顶级香水品牌',
  'https://images.example.com/icons/perfume.png',
  4,
  1
);

-- ============================================
-- 第三步：插入服装类商品
-- ============================================

-- 商品 1: 黑色真丝连衣裙
INSERT INTO products (
  name, subtitle, sku, description, category_id,
  is_new, is_sale_on, stock_quantity, low_stock_threshold,
  weight, free_shipping_threshold
) VALUES (
  '黑色真丝连衣裙',
  '春夏新款 · 显气质',
  'CLT-001',
  '采用100%真丝面料，舒适透气，简洁大气设计，适合各种场合',
  1,
  1, 1, 45, 10,
  180, 88.00
);

SET @product_1 = LAST_INSERT_ID();

-- 商品 2: 米白色针织衫
INSERT INTO products (
  name, subtitle, sku, description, category_id,
  is_new, is_sale_on, stock_quantity, low_stock_threshold,
  weight, free_shipping_threshold
) VALUES (
  '米白色针织衫',
  '质感毛衣 · 百搭款',
  'CLT-002',
  '精选羊毛混纺面料，柔软舒适，简约设计，穿搭百搭，四季皆宜',
  1,
  0, 1, 60, 15,
  250, 88.00
);

SET @product_2 = LAST_INSERT_ID();

-- 商品 3: 蓝色牛仔夹克
INSERT INTO products (
  name, subtitle, sku, description, category_id,
  is_new, is_sale_on, stock_quantity, low_stock_threshold,
  weight, free_shipping_threshold
) VALUES (
  '蓝色牛仔夹克',
  '复古设计 · 街头风格',
  'CLT-003',
  '高品质牛仔布料，做工精细，复古蓝色调，搭配多种风格',
  1,
  1, 1, 38, 8,
  450, 88.00
);

SET @product_3 = LAST_INSERT_ID();

-- ============================================
-- 第四步：插入珠宝类商品
-- ============================================

-- 商品 4: 18K金钻石项链
INSERT INTO products (
  name, subtitle, sku, description, category_id,
  is_new, is_sale_on, stock_quantity, low_stock_threshold,
  weight, free_shipping_threshold
) VALUES (
  '18K金钻石项链',
  '天然钻石 · 奢华首饰',
  'JWL-001',
  '采用18K黄金，镶嵌天然钻石，每颗钻石均经过国际认证，设计典雅大气',
  2,
  1, 1, 15, 3,
  15, 88.00
);

SET @product_4 = LAST_INSERT_ID();

-- 商品 5: 925银珍珠手镯
INSERT INTO products (
  name, subtitle, sku, description, category_id,
  is_new, is_sale_on, stock_quantity, low_stock_threshold,
  weight, free_shipping_threshold
) VALUES (
  '925银珍珠手镯',
  '天然珍珠 · 气质满分',
  'JWL-002',
  '采用925纯银，搭配天然淡水珍珠，精致典雅，适合日常和正式场合',
  2,
  1, 1, 28, 5,
  45, 88.00
);

SET @product_5 = LAST_INSERT_ID();

-- 商品 6: 翡翠玉石手镯
INSERT INTO products (
  name, subtitle, sku, description, category_id,
  is_new, is_sale_on, stock_quantity, low_stock_threshold,
  weight, free_shipping_threshold
) VALUES (
  '翡翠玉石手镯',
  '天然缅甸翡翠 · 收藏品',
  'JWL-003',
  '采用天然缅甸翡翠，油光润泽，工艺精湛，具有收藏价值',
  2,
  0, 1, 12, 2,
  80, 88.00
);

SET @product_6 = LAST_INSERT_ID();

-- ============================================
-- 第五步：插入鞋履类商品
-- ============================================

-- 商品 7: 黑色高跟鞋
INSERT INTO products (
  name, subtitle, sku, description, category_id,
  is_new, is_sale_on, stock_quantity, low_stock_threshold,
  weight, free_shipping_threshold
) VALUES (
  '黑色高跟鞋',
  '气质显气质 · 聚会必备',
  'SHO-001',
  '进口高级皮革材质，9厘米细跟设计，鞋垫舒适，搭配各种服装都显气质',
  3,
  1, 1, 55, 10,
  320, 88.00
);

SET @product_7 = LAST_INSERT_ID();

-- 商品 8: 白色运动鞋
INSERT INTO products (
  name, subtitle, sku, description, category_id,
  is_new, is_sale_on, stock_quantity, low_stock_threshold,
  weight, free_shipping_threshold
) VALUES (
  '白色运动鞋',
  '百搭款 · 舒适透气',
  'SHO-002',
  '采用透气网布和泡沫垫，轻盈舒适，可用于日常运动和休闲穿搭',
  3,
  1, 1, 72, 15,
  280, 88.00
);

SET @product_8 = LAST_INSERT_ID();

-- 商品 9: 棕色皮靴
INSERT INTO products (
  name, subtitle, sku, description, category_id,
  is_new, is_sale_on, stock_quantity, low_stock_threshold,
  weight, free_shipping_threshold
) VALUES (
  '棕色皮靴',
  '复古风格 · 耐磨耐用',
  'SHO-003',
  '头层牛皮制作，棕色经典设计，耐磨防滑，适合秋冬季节',
  3,
  0, 1, 38, 8,
  580, 88.00
);

SET @product_9 = LAST_INSERT_ID();

-- ============================================
-- 第六步：插入香水类商品
-- ============================================

-- 商品 10: 香奈儿五号香水
INSERT INTO products (
  name, subtitle, sku, description, category_id,
  is_new, is_sale_on, stock_quantity, low_stock_threshold,
  weight, free_shipping_threshold
) VALUES (
  '香奈儿五号香水',
  '经典传奇 · 优雅永恒',
  'PER-001',
  '世界最著名的香水之一，花香调，优雅高贵，适合各种场合',
  4,
  1, 1, 30, 5,
  150, 88.00
);

SET @product_10 = LAST_INSERT_ID();

-- 商品 11: 迪奥真我香水
INSERT INTO products (
  name, subtitle, sku, description, category_id,
  is_new, is_sale_on, stock_quantity, low_stock_threshold,
  weight, free_shipping_threshold
) VALUES (
  '迪奥真我香水',
  '果香型 · 年轻活力',
  'PER-002',
  '果香和花香完美融合，清新怡人，展现青春活力，持久留香',
  4,
  1, 1, 45, 8,
  140, 88.00
);

SET @product_11 = LAST_INSERT_ID();

-- 商品 12: 兰蔻魅力香水
INSERT INTO products (
  name, subtitle, sku, description, category_id,
  is_new, is_sale_on, stock_quantity, low_stock_threshold,
  weight, free_shipping_threshold
) VALUES (
  '兰蔻魅力香水',
  '木质调 · 神秘魅力',
  'PER-003',
  '木质和麝香完美组合，深邃神秘，彰显女性魅力，长效持香',
  4,
  0, 1, 25, 4,
  155, 88.00
);

SET @product_12 = LAST_INSERT_ID();

-- ============================================
-- 第七步：插入价格数据
-- ============================================

INSERT INTO product_prices (product_id, original_price, current_price, discount_rate, currency) VALUES
(@product_1, 128800, 99800, 78, 'CNY'),     -- 黑色真丝连衣裙
(@product_2, 89900, 69900, 78, 'CNY'),     -- 米白色针织衫
(@product_3, 169900, 129900, 76, 'CNY'),   -- 蓝色牛仔夹克
(@product_4, 580000, 448000, 77, 'CNY'),   -- 18K金钻石项链
(@product_5, 185000, 142800, 77, 'CNY'),   -- 925银珍珠手镯
(@product_6, 350000, 269000, 77, 'CNY'),   -- 翡翠玉石手镯
(@product_7, 68900, 54900, 80, 'CNY'),     -- 黑色高跟鞋
(@product_8, 49900, 39900, 80, 'CNY'),     -- 白色运动鞋
(@product_9, 89900, 71900, 80, 'CNY'),     -- 棕色皮靴
(@product_10, 149900, 119900, 80, 'CNY'),  -- 香奈儿五号香水
(@product_11, 98900, 79900, 81, 'CNY'),    -- 迪奥真我香水
(@product_12, 108900, 87900, 81, 'CNY');   -- 兰蔻魅力香水

-- ============================================
-- 第八步：插入商品图片
-- ============================================

-- 服装类商品图片
INSERT INTO product_images (product_id, image_url, image_type, alt_text, sort_order) VALUES
-- 黑色真丝连衣裙
(@product_1, 'https://images.example.com/clothing/black-silk-dress-thumb.jpg', 'thumb', '黑色真丝连衣裙', 1),
(@product_1, 'https://images.example.com/clothing/black-silk-dress-cover.jpg', 'cover', '黑色真丝连衣裙', 1),
(@product_1, 'https://images.example.com/clothing/black-silk-dress-detail-1.jpg', 'detail', '黑色真丝连衣裙效果图1', 1),
(@product_1, 'https://images.example.com/clothing/black-silk-dress-detail-2.jpg', 'detail', '黑色真丝连衣裙细节展示', 2),

-- 米白色针织衫
(@product_2, 'https://images.example.com/clothing/cream-knit-thumb.jpg', 'thumb', '米白色针织衫', 1),
(@product_2, 'https://images.example.com/clothing/cream-knit-cover.jpg', 'cover', '米白色针织衫', 1),
(@product_2, 'https://images.example.com/clothing/cream-knit-detail-1.jpg', 'detail', '米白色针织衫效果图', 1),

-- 蓝色牛仔夹克
(@product_3, 'https://images.example.com/clothing/denim-jacket-thumb.jpg', 'thumb', '蓝色牛仔夹克', 1),
(@product_3, 'https://images.example.com/clothing/denim-jacket-cover.jpg', 'cover', '蓝色牛仔夹克', 1),
(@product_3, 'https://images.example.com/clothing/denim-jacket-detail-1.jpg', 'detail', '蓝色牛仔夹克穿搭', 1);

-- 珠宝类商品图片
INSERT INTO product_images (product_id, image_url, image_type, alt_text, sort_order) VALUES
-- 18K金钻石项链
(@product_4, 'https://images.example.com/jewelry/diamond-necklace-thumb.jpg', 'thumb', '18K金钻石项链', 1),
(@product_4, 'https://images.example.com/jewelry/diamond-necklace-cover.jpg', 'cover', '18K金钻石项链', 1),
(@product_4, 'https://images.example.com/jewelry/diamond-necklace-detail-1.jpg', 'detail', '18K金钻石项链展示', 1),
(@product_4, 'https://images.example.com/jewelry/diamond-necklace-detail-2.jpg', 'detail', '钻石细节', 2),

-- 925银珍珠手镯
(@product_5, 'https://images.example.com/jewelry/pearl-bracelet-thumb.jpg', 'thumb', '925银珍珠手镯', 1),
(@product_5, 'https://images.example.com/jewelry/pearl-bracelet-cover.jpg', 'cover', '925银珍珠手镯', 1),
(@product_5, 'https://images.example.com/jewelry/pearl-bracelet-detail-1.jpg', 'detail', '925银珍珠手镯展示', 1),

-- 翡翠玉石手镯
(@product_6, 'https://images.example.com/jewelry/jade-bracelet-thumb.jpg', 'thumb', '翡翠玉石手镯', 1),
(@product_6, 'https://images.example.com/jewelry/jade-bracelet-cover.jpg', 'cover', '翡翠玉石手镯', 1),
(@product_6, 'https://images.example.com/jewelry/jade-bracelet-detail-1.jpg', 'detail', '翡翠玉石手镯展示', 1);

-- 鞋履类商品图片
INSERT INTO product_images (product_id, image_url, image_type, alt_text, sort_order) VALUES
-- 黑色高跟鞋
(@product_7, 'https://images.example.com/shoes/black-heels-thumb.jpg', 'thumb', '黑色高跟鞋', 1),
(@product_7, 'https://images.example.com/shoes/black-heels-cover.jpg', 'cover', '黑色高跟鞋', 1),
(@product_7, 'https://images.example.com/shoes/black-heels-detail-1.jpg', 'detail', '黑色高跟鞋穿搭', 1),

-- 白色运动鞋
(@product_8, 'https://images.example.com/shoes/white-sneakers-thumb.jpg', 'thumb', '白色运动鞋', 1),
(@product_8, 'https://images.example.com/shoes/white-sneakers-cover.jpg', 'cover', '白色运动鞋', 1),
(@product_8, 'https://images.example.com/shoes/white-sneakers-detail-1.jpg', 'detail', '白色运动鞋效果图', 1),

-- 棕色皮靴
(@product_9, 'https://images.example.com/shoes/brown-boots-thumb.jpg', 'thumb', '棕色皮靴', 1),
(@product_9, 'https://images.example.com/shoes/brown-boots-cover.jpg', 'cover', '棕色皮靴', 1),
(@product_9, 'https://images.example.com/shoes/brown-boots-detail-1.jpg', 'detail', '棕色皮靴展示', 1);

-- 香水类商品图片
INSERT INTO product_images (product_id, image_url, image_type, alt_text, sort_order) VALUES
-- 香奈儿五号香水
(@product_10, 'https://images.example.com/perfume/chanel-5-thumb.jpg', 'thumb', '香奈儿五号香水', 1),
(@product_10, 'https://images.example.com/perfume/chanel-5-cover.jpg', 'cover', '香奈儿五号香水', 1),
(@product_10, 'https://images.example.com/perfume/chanel-5-detail-1.jpg', 'detail', '香奈儿五号香水展示', 1),

-- 迪奥真我香水
(@product_11, 'https://images.example.com/perfume/dior-joy-thumb.jpg', 'thumb', '迪奥真我香水', 1),
(@product_11, 'https://images.example.com/perfume/dior-joy-cover.jpg', 'cover', '迪奥真我香水', 1),
(@product_11, 'https://images.example.com/perfume/dior-joy-detail-1.jpg', 'detail', '迪奥真我香水展示', 1),

-- 兰蔻魅力香水
(@product_12, 'https://images.example.com/perfume/lancome-charm-thumb.jpg', 'thumb', '兰蔻魅力香水', 1),
(@product_12, 'https://images.example.com/perfume/lancome-charm-cover.jpg', 'cover', '兰蔻魅力香水', 1),
(@product_12, 'https://images.example.com/perfume/lancome-charm-detail-1.jpg', 'detail', '兰蔻魅力香水展示', 1);

-- ============================================
-- 第九步：插入商品统计数据
-- ============================================

INSERT INTO product_stats (product_id, sales_count, views_count, average_rating, reviews_count, favorites_count) VALUES
(@product_1, 1250, 8500, 4.7, 168, 580),   -- 黑色真丝连衣裙
(@product_2, 850, 5200, 4.5, 95, 320),    -- 米白色针织衫
(@product_3, 680, 4100, 4.6, 78, 240),    -- 蓝色牛仔夹克
(@product_4, 320, 2800, 4.9, 52, 450),    -- 18K金钻石项链
(@product_5, 450, 3200, 4.8, 68, 380),    -- 925银珍珠手镯
(@product_6, 220, 1900, 4.8, 32, 280),    -- 翡翠玉石手镯
(@product_7, 1580, 9200, 4.6, 218, 620),  -- 黑色高跟鞋
(@product_8, 2100, 11500, 4.7, 285, 850), -- 白色运动鞋
(@product_9, 560, 3800, 4.5, 72, 220),    -- 棕色皮靴
(@product_10, 890, 6500, 4.9, 145, 720),  -- 香奈儿五号香水
(@product_11, 1250, 7800, 4.8, 168, 580), -- 迪奥真我香水
(@product_12, 680, 5200, 4.7, 95, 420);   -- 兰蔻魅力香水

-- ============================================
-- 第十步：插入商品属性（颜色、尺码）
-- ============================================

-- 黑色真丝连衣裙的颜色
INSERT INTO product_attributes (product_id, attribute_name, attribute_value, color_hex, stock_quantity) VALUES
(@product_1, 'color', '黑色', '#000000', 20),
(@product_1, 'color', '白色', '#FFFFFF', 15),
(@product_1, 'color', '深蓝', '#001F3F', 10);

-- 黑色真丝连衣裙的尺码
INSERT INTO product_attributes (product_id, attribute_name, attribute_value, size_sort_order, stock_quantity) VALUES
(@product_1, 'size', 'XS', 1, 8),
(@product_1, 'size', 'S', 2, 12),
(@product_1, 'size', 'M', 3, 15),
(@product_1, 'size', 'L', 4, 10);

-- 米白色针织衫的颜色
INSERT INTO product_attributes (product_id, attribute_name, attribute_value, color_hex, stock_quantity) VALUES
(@product_2, 'color', '米白', '#F5E6D3', 25),
(@product_2, 'color', '浅灰', '#D3D3D3', 20),
(@product_2, 'color', '卡其', '#C3B1A0', 15);

-- 米白色针织衫的尺码
INSERT INTO product_attributes (product_id, attribute_name, attribute_value, size_sort_order, stock_quantity) VALUES
(@product_2, 'size', 'S', 1, 15),
(@product_2, 'size', 'M', 2, 20),
(@product_2, 'size', 'L', 3, 15),
(@product_2, 'size', 'XL', 4, 10);

-- 白色运动鞋的颜色
INSERT INTO product_attributes (product_id, attribute_name, attribute_value, color_hex, stock_quantity) VALUES
(@product_8, 'color', '白色', '#FFFFFF', 30),
(@product_8, 'color', '黑白', '#A9A9A9', 25),
(@product_8, 'color', '灰白', '#D3D3D3', 17);

-- 白色运动鞋的尺码
INSERT INTO product_attributes (product_id, attribute_name, attribute_value, size_sort_order, stock_quantity) VALUES
(@product_8, 'size', '35', 1, 10),
(@product_8, 'size', '36', 2, 15),
(@product_8, 'size', '37', 3, 18),
(@product_8, 'size', '38', 4, 15),
(@product_8, 'size', '39', 5, 10),
(@product_8, 'size', '40', 6, 4);

-- ============================================
-- 第十一步：插入商品标签
-- ============================================

INSERT INTO product_tags (product_id, tag_name) VALUES
(@product_1, 'new'),                      -- 黑色真丝连衣裙 - 新品
(@product_1, 'hot'),                      -- 黑色真丝连衣裙 - 热销
(@product_2, 'discount'),                 -- 米白色针织衫 - 打折
(@product_3, 'new'),                      -- 蓝色牛仔夹克 - 新品
(@product_4, 'hot'),                      -- 18K金钻石项链 - 热销
(@product_4, 'vip_only'),                 -- 18K金钻石项链 - VIP专属
(@product_5, 'hot'),                      -- 925银珍珠手镯 - 热销
(@product_6, 'limited'),                  -- 翡翠玉石手镯 - 限量
(@product_7, 'hot'),                      -- 黑色高跟鞋 - 热销
(@product_8, 'hot'),                      -- 白色运动鞋 - 热销
(@product_9, 'discount'),                 -- 棕色皮靴 - 打折
(@product_10, 'hot'),                     -- 香奈儿五号香水 - 热销
(@product_11, 'new'),                     -- 迪奥真我香水 - 新品
(@product_12, 'discount');                -- 兰蔻魅力香水 - 打折

-- ============================================
-- 第十二步：插入商品详情
-- ============================================

INSERT INTO product_details (
  product_id, brand, material, origin,
  full_description, care_guide, warranty
) VALUES
(
  @product_1,
  '瑞竹时装',
  '100%真丝',
  '中国',
  '<h2>黑色真丝连衣裙</h2><p>采用意大利进口桑蚕真丝面料，手感顺滑，垂感优美。简洁的A字版型设计，修身显气质，适合各种场合穿着。</p><h3>产品特点：</h3><ul><li>100%真丝面料，透气舒适</li><li>精工细作，缝线均匀</li><li>简约大气设计风格</li><li>显气质百搭款</li></ul>',
  '冷水洗涤，不可漂白，自然干燥，低温熨烫',
  '非人为原因质量问题，售出30天内退换'
),
(
  @product_2,
  '瑞竹针织',
  '70%羊毛 30%涤纶',
  '中国',
  '<h2>米白色针织衫</h2><p>采用优质羊毛混纺面料，手感柔软温暖。简约的设计风格，适合春秋季节穿着，百搭各种下装。</p><h3>产品特点：</h3><ul><li>优质羊毛混纺</li><li>手感柔软温暖</li><li>简约设计</li><li>四季适穿</li></ul>',
  '干洗推荐，手洗时需温水，不可拧干',
  '质量问题30天内退换'
),
(
  @product_4,
  '瑞竹珠宝',
  '18K黄金、天然钻石',
  '中国',
  '<h2>18K金钻石项链</h2><p>采用18K黄金和天然钻石制作，每颗钻石均符合国际4C标准，设计典雅大气，是送礼和自用的绝佳选择。</p><h3>产品特点：</h3><ul><li>18K黄金纯正</li><li>天然钻石</li><li>国际认证</li><li>设计典雅</li></ul>',
  '定期清洁，避免碰撞，妥善收藏',
  '终身免费保修'
),
(
  @product_7,
  '瑞竹鞋履',
  '进口小牛皮',
  '意大利',
  '<h2>黑色高跟鞋</h2><p>采用意大利进口高级皮革材质，9厘米细跟设计，优雅大气。内部采用舒适垫层，穿着舒适，是气质女性的必备单品。</p><h3>产品特点：</h3><ul><li>进口皮革</li><li>9cm细跟</li><li>舒适垫层</li><li>显气质显腿长</li></ul>',
  '定期护理，避免雨水浸泡，干燥保存',
  '非人为损坏可免费修复'
),
(
  @product_10,
  '香奈儿',
  '香精、酒精',
  '法国',
  '<h2>香奈儿五号香水</h2><p>世界最著名的女性香水，由Grasse调香大师创作。花香调香氛，优雅而永恒，适合各种场合，是香水中的经典之作。</p><h3>产品特点：</h3><ul><li>经典花香调</li><li>持久留香</li><li>优雅气质</li><li>全球畅销</li></ul>',
  '存放在阴凉干燥处，避免阳光直射',
  '进口产品保真'
);

-- ============================================
-- 数据初始化完成！
-- ============================================
-- 统计结果
-- 分类数量: 4 个（服装、珠宝、鞋履、香水）
-- 商品数量: 12 个
-- 商品价格: 12 条记录
-- 商品图片: 39 条记录
-- 商品属性: 18 条记录
-- 商品统计: 12 条记录
-- 商品标签: 14 条记录
-- 商品详情: 5 条记录

-- 验证查询：
-- SELECT COUNT(*) FROM categories;
-- SELECT COUNT(*) FROM products;
-- SELECT COUNT(*) FROM product_prices;
-- SELECT COUNT(*) FROM product_images;
