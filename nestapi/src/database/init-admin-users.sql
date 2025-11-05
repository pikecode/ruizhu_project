-- ============================================
-- Admin 系统用户初始化数据
-- ============================================
-- 说明: 为 Admin 后台系统创建测试账户
-- 注意: 所有密码均已使用 bcryptjs 加密，原始密码见下方

-- ============================================
-- 账户列表：
-- ============================================
-- 1. 超级管理员
--    用户名: admin
--    密码: admin123456
--    邮箱: admin@ruizhu.com
--
-- 2. 商品经理
--    用户名: manager
--    密码: manager123456
--    邮箱: manager@ruizhu.com
--
-- 3. 操作员
--    用户名: operator
--    密码: operator123456
--    邮箱: operator@ruizhu.com
-- ============================================

-- 清空现有 admin_users 数据（可选，默认注释）
-- TRUNCATE TABLE admin_users;

-- 插入超级管理员账户
-- 密码: admin123456
INSERT IGNORE INTO admin_users (username, email, password, nickname, role, is_super_admin, status, created_at, updated_at)
VALUES (
  'admin',
  'admin@ruizhu.com',
  '$2a$10$PN6UxdAxMVFJYt2vJyLi7uEMdBnCu4sLmUhox.cNk7Ip6LoS8nM8S',
  '超级管理员',
  'admin',
  1,
  'active',
  NOW(),
  NOW()
);

-- 插入经理账户
-- 密码: manager123456
INSERT IGNORE INTO admin_users (username, email, password, nickname, role, is_super_admin, status, created_at, updated_at)
VALUES (
  'manager',
  'manager@ruizhu.com',
  '$2a$10$DcsYmwVxtZ5HRjNf0opDpuno3dPIEPvr6Z1byvqo0Az1qO7rITD9a',
  '商品经理',
  'manager',
  0,
  'active',
  NOW(),
  NOW()
);

-- 插入操作员账户
-- 密码: operator123456
INSERT IGNORE INTO admin_users (username, email, password, nickname, role, is_super_admin, status, created_at, updated_at)
VALUES (
  'operator',
  'operator@ruizhu.com',
  '$2a$10$/LzGtd/ws1Gt38xChDj.h.fRbbq.yH.rLS1hY7PC1Gtl4.8xKW6qq',
  '操作员',
  'operator',
  0,
  'active',
  NOW(),
  NOW()
);

-- 验证数据
-- SELECT id, username, email, nickname, role, is_super_admin, status FROM admin_users;
