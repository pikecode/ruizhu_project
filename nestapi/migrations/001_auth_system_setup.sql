-- =====================================================
-- Authentication System Database Migration
-- =====================================================

-- 1. Update Users Table
-- Add new fields for authentication tracking
ALTER TABLE `users`
  MODIFY COLUMN `username` VARCHAR(100) NOT NULL,
  ADD UNIQUE INDEX `idx_username` (`username`),
  ADD COLUMN `lastLoginAt` TIMESTAMP NULL DEFAULT NULL AFTER `isActive`,
  ADD COLUMN `lastLoginIp` VARCHAR(45) NULL DEFAULT NULL AFTER `lastLoginAt`,
  ADD COLUMN `resetPasswordToken` VARCHAR(255) NULL DEFAULT NULL AFTER `unionid`,
  ADD COLUMN `resetPasswordExpires` TIMESTAMP NULL DEFAULT NULL AFTER `resetPasswordToken`;

-- 2. Update Roles Table
-- Add code and level fields
ALTER TABLE `roles`
  ADD COLUMN `code` VARCHAR(100) NOT NULL AFTER `name`,
  ADD COLUMN `level` INT NOT NULL DEFAULT 0 COMMENT 'Role hierarchy level (0=super admin, 1=admin, 2=manager, 3=user)' AFTER `description`,
  ADD UNIQUE INDEX `idx_code` (`code`);

-- Update existing roles with codes (if any exist)
UPDATE `roles` SET `code` = LOWER(REPLACE(`name`, ' ', '_')) WHERE `code` = '';

-- 3. Create Permissions Table
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(100) NOT NULL,
  `description` VARCHAR(500) NULL DEFAULT NULL,
  `module` VARCHAR(50) NULL DEFAULT NULL COMMENT 'Module/feature this permission belongs to',
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `idx_name` (`name`),
  UNIQUE INDEX `idx_code` (`code`),
  INDEX `idx_module` (`module`),
  INDEX `idx_active` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create Role-Permission Junction Table
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `roleId` INT NOT NULL,
  `permissionId` INT NOT NULL,
  PRIMARY KEY (`roleId`, `permissionId`),
  CONSTRAINT `fk_role_permissions_role`
    FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_role_permissions_permission`
    FOREIGN KEY (`permissionId`) REFERENCES `permissions` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Create Refresh Tokens Table
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `token` TEXT NOT NULL,
  `userId` INT NOT NULL,
  `expiresAt` TIMESTAMP NOT NULL,
  `isRevoked` TINYINT(1) NOT NULL DEFAULT 0,
  `ipAddress` VARCHAR(45) NULL DEFAULT NULL,
  `userAgent` TEXT NULL DEFAULT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user` (`userId`),
  INDEX `idx_expires` (`expiresAt`),
  INDEX `idx_revoked` (`isRevoked`),
  CONSTRAINT `fk_refresh_tokens_user`
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Create Login Logs Table
CREATE TABLE IF NOT EXISTS `login_logs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `ipAddress` VARCHAR(45) NULL DEFAULT NULL,
  `userAgent` TEXT NULL DEFAULT NULL,
  `loginStatus` VARCHAR(50) NOT NULL COMMENT 'success, failed, blocked',
  `failureReason` VARCHAR(500) NULL DEFAULT NULL,
  `loginMethod` VARCHAR(100) NULL DEFAULT NULL COMMENT 'password, wechat, refresh_token',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user` (`userId`),
  INDEX `idx_status` (`loginStatus`),
  INDEX `idx_method` (`loginMethod`),
  INDEX `idx_created` (`createdAt`),
  CONSTRAINT `fk_login_logs_user`
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Seed Data: Default Roles
-- =====================================================

-- Insert default roles if they don't exist
INSERT INTO `roles` (`name`, `code`, `description`, `level`, `isActive`)
VALUES
  ('Super Admin', 'super_admin', 'Full system access with all permissions', 0, 1),
  ('Admin', 'admin', 'Administrative access to manage users and content', 1, 1),
  ('Manager', 'manager', 'Manage products, orders, and customers', 2, 1),
  ('User', 'user', 'Regular user with basic permissions', 3, 1)
ON DUPLICATE KEY UPDATE `code` = VALUES(`code`), `level` = VALUES(`level`);

-- =====================================================
-- Seed Data: Default Permissions
-- =====================================================

INSERT INTO `permissions` (`name`, `code`, `description`, `module`, `isActive`)
VALUES
  -- User Management
  ('View Users', 'users.view', 'View user list and details', 'users', 1),
  ('Create Users', 'users.create', 'Create new users', 'users', 1),
  ('Update Users', 'users.update', 'Update user information', 'users', 1),
  ('Delete Users', 'users.delete', 'Delete users', 'users', 1),

  -- Role Management
  ('View Roles', 'roles.view', 'View role list and details', 'roles', 1),
  ('Create Roles', 'roles.create', 'Create new roles', 'roles', 1),
  ('Update Roles', 'roles.update', 'Update role information', 'roles', 1),
  ('Delete Roles', 'roles.delete', 'Delete roles', 'roles', 1),

  -- Product Management
  ('View Products', 'products.view', 'View product list and details', 'products', 1),
  ('Create Products', 'products.create', 'Create new products', 'products', 1),
  ('Update Products', 'products.update', 'Update product information', 'products', 1),
  ('Delete Products', 'products.delete', 'Delete products', 'products', 1),

  -- Order Management
  ('View Orders', 'orders.view', 'View order list and details', 'orders', 1),
  ('Update Orders', 'orders.update', 'Update order status', 'orders', 1),
  ('Delete Orders', 'orders.delete', 'Delete orders', 'orders', 1),

  -- Category Management
  ('View Categories', 'categories.view', 'View category list', 'categories', 1),
  ('Manage Categories', 'categories.manage', 'Create, update, delete categories', 'categories', 1),

  -- Coupon Management
  ('View Coupons', 'coupons.view', 'View coupon list', 'coupons', 1),
  ('Manage Coupons', 'coupons.manage', 'Create, update, delete coupons', 'coupons', 1),

  -- System Settings
  ('View Settings', 'settings.view', 'View system settings', 'settings', 1),
  ('Update Settings', 'settings.update', 'Update system settings', 'settings', 1)
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- =====================================================
-- Seed Data: Assign Permissions to Roles
-- =====================================================

-- Super Admin gets all permissions
INSERT INTO `role_permissions` (`roleId`, `permissionId`)
SELECT r.id, p.id
FROM `roles` r
CROSS JOIN `permissions` p
WHERE r.code = 'super_admin'
ON DUPLICATE KEY UPDATE `roleId` = VALUES(`roleId`);

-- Admin gets most permissions except some system settings
INSERT INTO `role_permissions` (`roleId`, `permissionId`)
SELECT r.id, p.id
FROM `roles` r
CROSS JOIN `permissions` p
WHERE r.code = 'admin'
  AND p.code NOT IN ('settings.update')
ON DUPLICATE KEY UPDATE `roleId` = VALUES(`roleId`);

-- Manager gets product, order, and category management
INSERT INTO `role_permissions` (`roleId`, `permissionId`)
SELECT r.id, p.id
FROM `roles` r
CROSS JOIN `permissions` p
WHERE r.code = 'manager'
  AND p.code IN (
    'products.view', 'products.create', 'products.update', 'products.delete',
    'orders.view', 'orders.update',
    'categories.view', 'categories.manage',
    'coupons.view', 'coupons.manage'
  )
ON DUPLICATE KEY UPDATE `roleId` = VALUES(`roleId`);

-- User gets basic view permissions
INSERT INTO `role_permissions` (`roleId`, `permissionId`)
SELECT r.id, p.id
FROM `roles` r
CROSS JOIN `permissions` p
WHERE r.code = 'user'
  AND p.code IN ('products.view', 'categories.view', 'orders.view')
ON DUPLICATE KEY UPDATE `roleId` = VALUES(`roleId`);

-- =====================================================
-- Cleanup and Optimization
-- =====================================================

-- Add indexes for better query performance
ALTER TABLE `users`
  ADD INDEX `idx_email` (`email`),
  ADD INDEX `idx_active` (`isActive`),
  ADD INDEX `idx_role` (`roleId`);

-- Optimize tables
OPTIMIZE TABLE `users`;
OPTIMIZE TABLE `roles`;
OPTIMIZE TABLE `permissions`;
OPTIMIZE TABLE `role_permissions`;
OPTIMIZE TABLE `refresh_tokens`;
OPTIMIZE TABLE `login_logs`;
