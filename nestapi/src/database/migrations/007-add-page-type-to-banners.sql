-- 为banners表添加page_type字段
-- 用于区分首页(home)和私人定制(custom)页面的banner

-- 添加page_type字段
ALTER TABLE banners
ADD COLUMN page_type ENUM('home', 'custom') NOT NULL DEFAULT 'home'
COMMENT '页面类型：home(首页) custom(私人定制)'
AFTER video_thumbnail_key;

-- 添加索引以优化查询性能
CREATE INDEX idx_page_type ON banners(page_type);
CREATE INDEX idx_page_type_sort ON banners(page_type, sort_order);

-- 注意：如果需要更新现有banner数据的page_type值，请在执行此迁移后手动运行更新语句
-- 例如：UPDATE banners SET page_type = 'custom' WHERE id IN (1, 2, 3);
