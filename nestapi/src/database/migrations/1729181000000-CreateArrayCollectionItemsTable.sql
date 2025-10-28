-- 创建数组集合项目表（array_collection_items）
-- 用于存储集合中的卡片项目
CREATE TABLE IF NOT EXISTS `array_collection_items` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `array_collection_id` INT NOT NULL COMMENT '所属数组集合ID',
  `title` VARCHAR(100) NOT NULL COMMENT '卡片标题',
  `description` VARCHAR(500) COMMENT '卡片描述',
  `cover_image_url` VARCHAR(500) COMMENT '卡片封面图片URL',
  `sort_order` INT DEFAULT 0 COMMENT '在集合内的显示顺序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  INDEX `idx_array_collection_sort` (`array_collection_id`, `sort_order`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`array_collection_id`) REFERENCES `array_collections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数组集合项目表（卡片）';
