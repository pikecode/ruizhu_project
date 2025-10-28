-- 创建数组集合项目商品关联表（array_collection_item_products）
-- 用于存储卡片项目与商品的关联关系和排序
CREATE TABLE IF NOT EXISTS `array_collection_item_products` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `array_collection_item_id` INT NOT NULL COMMENT '所属数组集合项目（卡片）ID',
  `product_id` INT NOT NULL COMMENT '商品ID',
  `sort_order` INT DEFAULT 0 COMMENT '在卡片内的显示顺序',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  UNIQUE KEY `uk_item_product` (`array_collection_item_id`, `product_id`),
  INDEX `idx_item_sort` (`array_collection_item_id`, `sort_order`),
  INDEX `idx_product_id` (`product_id`),
  FOREIGN KEY (`array_collection_item_id`) REFERENCES `array_collection_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数组集合项目商品关联表';
