-- 为 array_collections 表添加 slug 列（如果不存在）
ALTER TABLE `array_collections`
ADD COLUMN `slug` VARCHAR(100) UNIQUE COMMENT '集合的slug，用于URL和查询' AFTER `title`;

-- 为 slug 列添加唯一索引（如果还没有）
CREATE UNIQUE INDEX `idx_slug` ON `array_collections` (`slug`);
