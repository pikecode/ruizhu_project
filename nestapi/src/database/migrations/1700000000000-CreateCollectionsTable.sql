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
