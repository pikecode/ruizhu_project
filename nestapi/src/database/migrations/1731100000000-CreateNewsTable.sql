-- Create news table
CREATE TABLE IF NOT EXISTS `news` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL COMMENT '标题',
  `subtitle` varchar(255) NULL COMMENT '副标题',
  `description` text NULL COMMENT '描述',
  `cover_image_key` varchar(500) NULL COMMENT '封面图文件Key (COS)',
  `detail_image_key` varchar(500) NULL COMMENT '详情图文件Key (COS)',
  `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序顺序',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_sort_order` (`sort_order`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
