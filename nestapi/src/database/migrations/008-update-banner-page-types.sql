-- 更新现有banner数据的page_type值
-- 这个脚本是可选的，用于将现有的banner数据分配到不同的页面类型

-- 方法1: 根据ID范围或条件更新
-- 示例：将特定ID的banner设置为私人定制页面
-- UPDATE banners SET page_type = 'custom' WHERE id IN (1, 2, 3);

-- 方法2: 根据标题关键词更新
-- 示例：标题包含"定制"的banner设置为私人定制页面
-- UPDATE banners SET page_type = 'custom' WHERE main_title LIKE '%定制%';

-- 方法3: 手动指定
-- 根据实际业务需求，手动更新每个banner的page_type值

-- 查看当前所有banner及其page_type
SELECT id, main_title, page_type, is_active, sort_order FROM banners ORDER BY id;

-- 注意：
-- 1. 默认情况下，所有banner的page_type为'home'
-- 2. 如果需要将某些banner用于私人定制页面，请运行UPDATE语句更新对应的记录
-- 3. 建议在更新前先备份数据
