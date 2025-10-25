-- ============================================================
-- Ruizhu E-Commerce Platform - Database Initialization Script
-- ============================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS ruizhu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE ruizhu;

-- ============================================================
-- Users Table
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY COMMENT 'User unique identifier',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT 'Username',
  email VARCHAR(100) NOT NULL UNIQUE COMMENT 'User email',
  password_hash VARCHAR(255) NOT NULL COMMENT 'Hashed password',

  profile_picture VARCHAR(255) NULL COMMENT 'User profile picture URL',
  phone_number VARCHAR(20) NULL COMMENT 'Phone number',

  role_id VARCHAR(36) NULL COMMENT 'User role',

  is_active BOOLEAN DEFAULT TRUE COMMENT 'Is user active',
  is_verified BOOLEAN DEFAULT FALSE COMMENT 'Is email verified',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp',

  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role_id (role_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Users table';

-- ============================================================
-- Roles Table
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(36) PRIMARY KEY COMMENT 'Role unique identifier',
  name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Role name',
  description VARCHAR(255) NULL COMMENT 'Role description',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',

  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Roles table';

-- ============================================================
-- Permissions Table
-- ============================================================
CREATE TABLE IF NOT EXISTS permissions (
  id VARCHAR(36) PRIMARY KEY COMMENT 'Permission unique identifier',
  name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Permission name',
  resource VARCHAR(50) NOT NULL COMMENT 'Resource type',
  action VARCHAR(50) NOT NULL COMMENT 'Action type',
  description VARCHAR(255) NULL COMMENT 'Permission description',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',

  UNIQUE KEY unique_resource_action (resource, action),
  INDEX idx_resource (resource)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Permissions table';

-- ============================================================
-- Role Permissions Junction Table
-- ============================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id VARCHAR(36) NOT NULL,
  permission_id VARCHAR(36) NOT NULL,

  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Role-Permission mapping table';

-- ============================================================
-- Products Table
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(36) PRIMARY KEY COMMENT 'Product unique identifier',
  name VARCHAR(100) NOT NULL COMMENT 'Product name',
  description TEXT NULL COMMENT 'Product description',

  category VARCHAR(50) NOT NULL COMMENT 'Product category',
  price DECIMAL(10, 2) NOT NULL COMMENT 'Product price',
  cost DECIMAL(10, 2) NULL COMMENT 'Product cost',

  stock INT NOT NULL DEFAULT 0 COMMENT 'Stock quantity',
  reserved_stock INT DEFAULT 0 COMMENT 'Reserved stock',

  sku VARCHAR(50) NOT NULL UNIQUE COMMENT 'Stock keeping unit',

  image_url VARCHAR(255) NULL COMMENT 'Product main image URL',
  images JSON NULL COMMENT 'Product images JSON array',

  rating DECIMAL(3, 2) DEFAULT 0 COMMENT 'Average rating',
  review_count INT DEFAULT 0 COMMENT 'Number of reviews',

  is_active BOOLEAN DEFAULT TRUE COMMENT 'Is product active',
  is_featured BOOLEAN DEFAULT FALSE COMMENT 'Is product featured',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',

  INDEX idx_name (name),
  INDEX idx_category (category),
  INDEX idx_price (price),
  INDEX idx_sku (sku),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Products table';

-- ============================================================
-- Orders Table
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY COMMENT 'Order unique identifier',
  user_id VARCHAR(36) NOT NULL COMMENT 'User who placed the order',

  order_number VARCHAR(50) NOT NULL UNIQUE COMMENT 'Order number',

  status VARCHAR(50) DEFAULT 'pending' COMMENT 'Order status: pending, confirmed, shipped, delivered, cancelled',

  subtotal DECIMAL(10, 2) NOT NULL COMMENT 'Order subtotal',
  tax DECIMAL(10, 2) DEFAULT 0 COMMENT 'Tax amount',
  shipping_fee DECIMAL(10, 2) DEFAULT 0 COMMENT 'Shipping fee',
  discount DECIMAL(10, 2) DEFAULT 0 COMMENT 'Discount amount',
  total DECIMAL(10, 2) NOT NULL COMMENT 'Order total',

  payment_method VARCHAR(50) NULL COMMENT 'Payment method',
  payment_status VARCHAR(50) DEFAULT 'pending' COMMENT 'Payment status',

  shipping_address JSON NOT NULL COMMENT 'Shipping address JSON',
  billing_address JSON NULL COMMENT 'Billing address JSON',

  notes TEXT NULL COMMENT 'Order notes',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  completed_at TIMESTAMP NULL COMMENT 'Order completion timestamp',

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_order_number (order_number),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Orders table';

-- ============================================================
-- Order Items Table
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(36) PRIMARY KEY COMMENT 'Order item unique identifier',
  order_id VARCHAR(36) NOT NULL COMMENT 'Order ID',
  product_id VARCHAR(36) NOT NULL COMMENT 'Product ID',

  product_name VARCHAR(100) NOT NULL COMMENT 'Product name at time of order',
  product_sku VARCHAR(50) NOT NULL COMMENT 'Product SKU at time of order',

  quantity INT NOT NULL COMMENT 'Quantity ordered',
  unit_price DECIMAL(10, 2) NOT NULL COMMENT 'Unit price at time of order',
  total_price DECIMAL(10, 2) NOT NULL COMMENT 'Total price for this item',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_order_id (order_id),
  INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Order items table';

-- ============================================================
-- User Addresses Table
-- ============================================================
CREATE TABLE IF NOT EXISTS user_addresses (
  id VARCHAR(36) PRIMARY KEY COMMENT 'Address unique identifier',
  user_id VARCHAR(36) NOT NULL COMMENT 'User ID',

  type VARCHAR(20) NOT NULL COMMENT 'Address type: home, office, other',

  street VARCHAR(255) NOT NULL COMMENT 'Street address',
  city VARCHAR(100) NOT NULL COMMENT 'City',
  province VARCHAR(100) NOT NULL COMMENT 'Province/State',
  postal_code VARCHAR(20) NOT NULL COMMENT 'Postal code',
  country VARCHAR(100) NOT NULL COMMENT 'Country',

  phone_number VARCHAR(20) NULL COMMENT 'Phone number for delivery',
  full_name VARCHAR(100) NOT NULL COMMENT 'Recipient name',

  is_default BOOLEAN DEFAULT FALSE COMMENT 'Is default address',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Is address active',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User addresses table';

-- ============================================================
-- Insert Default Roles
-- ============================================================
INSERT IGNORE INTO roles (id, name, description) VALUES
('role_admin', 'Admin', 'Administrator with full access'),
('role_user', 'User', 'Regular user'),
('role_moderator', 'Moderator', 'Moderator with limited admin access');

-- ============================================================
-- Insert Default Permissions
-- ============================================================
INSERT IGNORE INTO permissions (id, name, resource, action, description) VALUES
('perm_users_read', 'Read Users', 'users', 'read', 'Can read user data'),
('perm_users_create', 'Create Users', 'users', 'create', 'Can create new users'),
('perm_users_update', 'Update Users', 'users', 'update', 'Can update users'),
('perm_users_delete', 'Delete Users', 'users', 'delete', 'Can delete users'),
('perm_products_read', 'Read Products', 'products', 'read', 'Can read products'),
('perm_products_create', 'Create Products', 'products', 'create', 'Can create products'),
('perm_products_update', 'Update Products', 'products', 'update', 'Can update products'),
('perm_products_delete', 'Delete Products', 'products', 'delete', 'Can delete products'),
('perm_orders_read', 'Read Orders', 'orders', 'read', 'Can read orders'),
('perm_orders_create', 'Create Orders', 'orders', 'create', 'Can create orders'),
('perm_orders_update', 'Update Orders', 'orders', 'update', 'Can update orders'),
('perm_orders_delete', 'Delete Orders', 'orders', 'delete', 'Can delete orders');

-- ============================================================
-- Assign Admin Permissions
-- ============================================================
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 'role_admin', id FROM permissions;

-- ============================================================
-- Assign User Basic Permissions
-- ============================================================
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 'role_user', id FROM permissions WHERE resource IN ('orders') AND action IN ('read', 'create');

-- ============================================================
-- Summary
-- ============================================================
-- Tables created:
-- - users: User accounts
-- - roles: User roles
-- - permissions: System permissions
-- - role_permissions: Role-Permission mapping
-- - products: Product catalog
-- - orders: Customer orders
-- - order_items: Items within orders
-- - user_addresses: Delivery addresses
--
-- Default data:
-- - 3 roles (Admin, User, Moderator)
-- - 12 permissions (CRUD for users, products, orders)

SELECT 'Database initialization complete!' AS status;
