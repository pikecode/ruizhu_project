-- 创建数组集合表（array_collections）
CREATE TABLE IF NOT EXISTS `array_collections` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(100) NOT NULL COMMENT '集合标题',
  `description` VARCHAR(500) COMMENT '集合描述',
  `sort_order` INT DEFAULT 0 COMMENT '显示顺序',
  `is_active` TINYINT DEFAULT 1 COMMENT '是否激活',
  `remark` TEXT COMMENT '备注说明',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  INDEX `idx_is_active_sort_order` (`is_active`, `sort_order`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数组集合表（包含多个卡片项目）';
