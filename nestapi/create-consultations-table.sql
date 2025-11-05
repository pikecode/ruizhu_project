-- 创建咨询表
CREATE TABLE IF NOT EXISTS `consultations` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '咨询ID',
  `product_id` int NOT NULL COMMENT '产品ID',
  `product_name` varchar(255) NOT NULL COMMENT '产品名称',
  `category_id` int NOT NULL COMMENT '类别ID',
  `category_name` varchar(100) NOT NULL COMMENT '类别名称',
  `user_name` varchar(100) NOT NULL COMMENT '用户姓名',
  `user_phone` varchar(20) NOT NULL COMMENT '用户电话',
  `user_email` varchar(255) COMMENT '用户邮箱',
  `color` varchar(100) COMMENT '选择的颜色',
  -- 服装相关字段
  `height` varchar(50) COMMENT '身高(cm)',
  `weight` varchar(50) COMMENT '体重(kg)',
  `chest` varchar(50) COMMENT '胸围(cm)',
  `waist` varchar(50) COMMENT '腰围(cm)',
  `hip` varchar(50) COMMENT '臀围(cm)',
  -- 鞋履相关字段
  `shoe_size` varchar(50) COMMENT '鞋码(欧码)',
  -- 珠宝相关字段
  `ring_size` varchar(50) COMMENT '戒指码',
  `jewelry_size` varchar(50) COMMENT '珠宝尺寸(mm)',
  `jewelry_material` varchar(100) COMMENT '珠宝材质偏好',
  -- 香水相关字段
  `perfume_preference` varchar(100) COMMENT '香调偏好',
  -- 通用字段
  `remarks` longtext COMMENT '备注/定制需求',
  `status` enum('unread','read','processing','completed') NOT NULL DEFAULT 'unread' COMMENT '咨询状态',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_user_phone` (`user_phone`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_product_category` (`product_id`, `category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品咨询表';
