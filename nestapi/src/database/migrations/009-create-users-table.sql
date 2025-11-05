-- 创建用户表
-- 支持多种认证方式：手机号、微信openId、用户名密码
-- 主要登录方式：手机号 + 微信小程序授权

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',

  -- 认证字段
  phone VARCHAR(20) UNIQUE COMMENT '手机号 - 微信手机号授权解密后的手机号，主要登录方式',
  open_id VARCHAR(100) UNIQUE COMMENT '微信openId - 小程序用户唯一标识',
  username VARCHAR(100) UNIQUE COMMENT '用户名 - 传统用户名密码登录，可选',
  email VARCHAR(100) UNIQUE COMMENT '用户邮箱，可选',
  password VARCHAR(255) COMMENT '密码哈希 - 仅用于用户名密码登录',

  -- 基本信息
  nickname VARCHAR(100) COMMENT '昵称',
  avatar_url VARCHAR(500) COMMENT '头像URL - 微信头像或上传的头像',

  -- 个人信息（来自微信授权）
  gender ENUM('male', 'female', 'unknown') DEFAULT 'unknown' COMMENT '性别',
  province VARCHAR(200) COMMENT '省份',
  city VARCHAR(200) COMMENT '城市',
  country VARCHAR(200) COMMENT '国家',

  -- 授权状态
  is_phone_authorized BOOLEAN DEFAULT FALSE COMMENT '是否已授权手机号',
  is_profile_authorized BOOLEAN DEFAULT FALSE COMMENT '是否已授权昵称和头像',

  -- 账户状态
  status ENUM('active', 'banned', 'deleted') DEFAULT 'active' COMMENT '账户状态',
  registration_source ENUM('wechat_mini_program', 'web', 'admin') DEFAULT 'wechat_mini_program' COMMENT '注册来源',

  -- 登录信息
  last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
  last_login_ip VARCHAR(50) COMMENT '最后登录IP',
  login_count INT DEFAULT 0 COMMENT '总登录次数',

  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  -- 索引
  UNIQUE KEY idx_phone (phone),
  UNIQUE KEY idx_open_id (open_id),
  UNIQUE KEY idx_username (username),
  UNIQUE KEY idx_email (email),
  INDEX idx_status (status),
  INDEX idx_registration_source (registration_source),
  INDEX idx_phone_authorized (is_phone_authorized),
  INDEX idx_profile_authorized (is_profile_authorized),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_last_login_at (last_login_at DESC)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表 - 支持手机号、微信openId、用户名密码多种认证方式';
