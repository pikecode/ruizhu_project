-- 创建首页Banner表
-- 用于存储小程序首页轮播图/视频
-- 支持图片和视频，视频自动转换为WebP格式

CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  main_title VARCHAR(255) NOT NULL COMMENT '大标题',
  subtitle VARCHAR(255) COMMENT '小标题',
  description TEXT COMMENT '描述',

  -- 媒体字段
  type ENUM('image', 'video') DEFAULT 'image' COMMENT '类型：image或video',
  image_url VARCHAR(500) COMMENT '图片URL (COS)',
  image_key VARCHAR(255) COMMENT '图片文件Key (COS)',

  video_url VARCHAR(500) COMMENT '视频URL (COS) - webp格式',
  video_key VARCHAR(255) COMMENT '视频文件Key (COS)',
  video_thumbnail_url VARCHAR(500) COMMENT '视频封面图URL',
  video_thumbnail_key VARCHAR(255) COMMENT '视频封面文件Key',

  -- 状态字段
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  sort_order INT DEFAULT 0 COMMENT '排序顺序',

  -- 跳转字段（可选）
  link_type ENUM('none', 'product', 'category', 'collection', 'url') DEFAULT 'none' COMMENT '链接类型',
  link_value VARCHAR(500) COMMENT '链接值（产品ID、分类ID、URL等）',

  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- 索引
  INDEX idx_sort_order (sort_order),
  INDEX idx_is_active (is_active),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='首页Banner表';
