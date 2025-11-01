-- 创建 Admin 管理员用户表
-- 用于 Admin 后台系统的身份验证和权限管理
-- 与 users 表分离，users 表是小程序消费者用户

CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Admin用户ID',

  -- 认证信息
  username VARCHAR(100) UNIQUE NOT NULL COMMENT '用户名 - 唯一标识',
  email VARCHAR(100) UNIQUE COMMENT '邮箱',
  password VARCHAR(255) NOT NULL COMMENT '密码哈希 - bcryptjs加密',

  -- 基本信息
  nickname VARCHAR(100) COMMENT '昵称',
  avatar_url VARCHAR(500) COMMENT '头像URL',

  -- 权限和角色
  role ENUM('admin', 'manager', 'operator') DEFAULT 'operator' COMMENT '角色: admin(超管) manager(经理) operator(操作员)',
  permissions JSON COMMENT '权限列表 - JSON格式存储',

  -- 账户状态
  status ENUM('active', 'inactive', 'banned') DEFAULT 'active' COMMENT '账户状态',
  is_super_admin BOOLEAN DEFAULT FALSE COMMENT '是否是超级管理员',

  -- 登录信息
  last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
  last_login_ip VARCHAR(50) COMMENT '最后登录IP',
  login_count INT DEFAULT 0 COMMENT '总登录次数',

  -- 审计字段
  created_by INT COMMENT '创建者ID',
  updated_by INT COMMENT '更新者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  -- 索引
  UNIQUE KEY idx_username (username),
  UNIQUE KEY idx_email (email),
  INDEX idx_status (status),
  INDEX idx_role (role),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_last_login_at (last_login_at DESC)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Admin管理员用户表 - 用于后台管理系统';
