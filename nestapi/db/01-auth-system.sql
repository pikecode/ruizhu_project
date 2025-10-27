-- =========================================
-- Ruizhu E-Commerce Platform
-- 01. 用户认证系统数据库设计
-- =========================================
-- 执行时间: 2025-10-27
-- 版本: 1.0

-- =========================================
-- 1. 用户表 (users)
-- =========================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  email VARCHAR(100) UNIQUE NOT NULL COMMENT '邮箱',
  phone VARCHAR(20) UNIQUE COMMENT '手机号',
  password VARCHAR(255) NOT NULL COMMENT '加密后的密码',

  -- 个人信息
  nickname VARCHAR(100) COMMENT '昵称',
  avatar_url VARCHAR(500) COMMENT '头像URL',
  real_name VARCHAR(100) COMMENT '真实姓名',

  -- 账户状态
  status ENUM('active', 'inactive', 'suspended', 'deleted') DEFAULT 'active' COMMENT '账户状态: active-正常, inactive-未激活, suspended-已禁用, deleted-已删除',
  is_email_verified BOOLEAN DEFAULT FALSE COMMENT '邮箱是否验证',
  is_phone_verified BOOLEAN DEFAULT FALSE COMMENT '手机是否验证',

  -- 用户类型
  user_type ENUM('customer', 'seller', 'admin') DEFAULT 'customer' COMMENT '用户类型: customer-普通客户, seller-商家, admin-管理员',

  -- 登录信息
  last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
  last_login_ip VARCHAR(45) COMMENT '最后登录IP',
  login_count INT DEFAULT 0 COMMENT '登录次数',

  -- 时间戳
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  deleted_at TIMESTAMP NULL COMMENT '删除时间（软删除）',

  -- 索引
  KEY idx_username (username),
  KEY idx_email (email),
  KEY idx_phone (phone),
  KEY idx_status (status),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =========================================
-- 2. 用户角色关联表 (user_roles)
-- =========================================
CREATE TABLE IF NOT EXISTS user_roles (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '关联ID',
  user_id INT NOT NULL COMMENT '用户ID',
  role_id INT NOT NULL COMMENT '角色ID',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  -- 索引和外键
  UNIQUE KEY unique_user_role (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- =========================================
-- 3. 角色表 (roles)
-- =========================================
CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '角色ID',
  name VARCHAR(50) UNIQUE NOT NULL COMMENT '角色名称',
  description VARCHAR(255) COMMENT '角色描述',

  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '角色状态',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  KEY idx_name (name),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- =========================================
-- 4. 权限表 (permissions)
-- =========================================
CREATE TABLE IF NOT EXISTS permissions (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '权限ID',
  name VARCHAR(100) UNIQUE NOT NULL COMMENT '权限名称',
  description VARCHAR(255) COMMENT '权限描述',
  resource VARCHAR(100) NOT NULL COMMENT '资源（模块）',
  action VARCHAR(50) NOT NULL COMMENT '操作',

  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '权限状态',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

  UNIQUE KEY unique_resource_action (resource, action),
  KEY idx_name (name),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- =========================================
-- 5. 角色权限关联表 (role_permissions)
-- =========================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '关联ID',
  role_id INT NOT NULL COMMENT '角色ID',
  permission_id INT NOT NULL COMMENT '权限ID',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  UNIQUE KEY unique_role_permission (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- =========================================
-- 6. 刷新令牌表 (refresh_tokens)
-- =========================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '令牌ID',
  user_id INT NOT NULL COMMENT '用户ID',
  token VARCHAR(500) NOT NULL UNIQUE COMMENT '刷新令牌',

  expires_at TIMESTAMP NOT NULL COMMENT '过期时间',
  is_revoked BOOLEAN DEFAULT FALSE COMMENT '是否已撤销',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_user_id (user_id),
  KEY idx_expires_at (expires_at),
  KEY idx_is_revoked (is_revoked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='刷新令牌表';

-- =========================================
-- 7. 登录日志表 (login_logs)
-- =========================================
CREATE TABLE IF NOT EXISTS login_logs (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
  user_id INT COMMENT '用户ID',
  username VARCHAR(50) NOT NULL COMMENT '用户名',

  ip_address VARCHAR(45) NOT NULL COMMENT 'IP地址',
  user_agent VARCHAR(500) COMMENT '用户代理',

  status ENUM('success', 'failed') DEFAULT 'success' COMMENT '登录状态',
  error_message VARCHAR(255) COMMENT '错误信息（如果失败）',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  KEY idx_user_id (user_id),
  KEY idx_username (username),
  KEY idx_status (status),
  KEY idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录日志表';

-- =========================================
-- 初始化数据
-- =========================================

-- 插入默认角色
INSERT INTO roles (name, description, status) VALUES
('admin', '管理员', 'active'),
('seller', '商家', 'active'),
('customer', '普通客户', 'active');

-- 插入权限
INSERT INTO permissions (name, description, resource, action, status) VALUES
-- 用户权限
('user_view', '查看用户', 'users', 'view', 'active'),
('user_create', '创建用户', 'users', 'create', 'active'),
('user_edit', '编辑用户', 'users', 'edit', 'active'),
('user_delete', '删除用户', 'users', 'delete', 'active'),

-- 商品权限
('product_view', '查看商品', 'products', 'view', 'active'),
('product_create', '创建商品', 'products', 'create', 'active'),
('product_edit', '编辑商品', 'products', 'edit', 'active'),
('product_delete', '删除商品', 'products', 'delete', 'active'),

-- 订单权限
('order_view', '查看订单', 'orders', 'view', 'active'),
('order_edit', '编辑订单', 'orders', 'edit', 'active'),
('order_delete', '删除订单', 'orders', 'delete', 'active'),

-- 管理权限
('admin_panel_access', '访问管理后台', 'admin', 'access', 'active'),
('system_settings', '系统设置', 'system', 'settings', 'active');

-- 为 admin 角色分配所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE name = 'admin'), id FROM permissions;

-- 为 customer 角色分配查看权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT (SELECT id FROM roles WHERE name = 'customer'), id FROM permissions WHERE action = 'view';

-- =========================================
-- 数据库检查
-- =========================================
-- 执行以下查询验证表创建成功
-- SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'mydb' AND table_name LIKE '%user%' OR table_name LIKE '%role%' OR table_name LIKE '%permission%';
