-- Ruizhu E-commerce Database Initialization Script (Corrected Table Order)
-- Database: mydb

USE mydb;

-- ============================================
-- Drop all tables in correct order (respecting FKs)
-- ============================================

DROP TABLE IF EXISTS `payment`;
DROP TABLE IF EXISTS `order_item`;
DROP TABLE IF EXISTS `order`;
DROP TABLE IF EXISTS `wishlist_item`;
DROP TABLE IF EXISTS `wishlist`;
DROP TABLE IF EXISTS `cart_item`;
DROP TABLE IF EXISTS `cart`;
DROP TABLE IF EXISTS `product_variant`;
DROP TABLE IF EXISTS `product_image`;
DROP TABLE IF EXISTS `product`;
DROP TABLE IF EXISTS `category`;
DROP TABLE IF EXISTS `coupon`;
DROP TABLE IF EXISTS `collection`;
DROP TABLE IF EXISTS `address`;
DROP TABLE IF EXISTS `file`;
DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `role`;

-- ============================================
-- Users & Auth Tables
-- ============================================

CREATE TABLE `role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255),
  `permissions` text,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(255),
  `avatar` varchar(255),
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `roleId` int,
  `openid` varchar(255),
  `sessionKey` varchar(255),
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_email` (`email`),
  UNIQUE KEY `IDX_username` (`username`),
  KEY `FK_roleId` (`roleId`),
  CONSTRAINT `FK_user_roleId` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- File Management Tables
-- ============================================

CREATE TABLE `file` (
  `id` int NOT NULL AUTO_INCREMENT,
  `originalName` varchar(255) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `mimetype` varchar(255),
  `size` int NOT NULL,
  `path` varchar(255) NOT NULL,
  `url` varchar(255),
  `uploadedBy` int,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_uploadedBy` (`uploadedBy`),
  CONSTRAINT `FK_file_uploadedBy` FOREIGN KEY (`uploadedBy`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Address Table (MOVED BEFORE ORDER)
-- ============================================

CREATE TABLE `address` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `firstName` varchar(255),
  `lastName` varchar(255),
  `phoneNumber` varchar(20),
  `email` varchar(255),
  `street` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `state` varchar(255),
  `postalCode` varchar(20),
  `country` varchar(255) NOT NULL,
  `isDefault` tinyint NOT NULL DEFAULT 0,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_userId` (`userId`),
  CONSTRAINT `FK_address_userId` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Category Table
-- ============================================

CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255),
  `image` varchar(255),
  `slug` varchar(255),
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Coupon Table
-- ============================================

CREATE TABLE `coupon` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(255) NOT NULL,
  `discountType` varchar(20) NOT NULL DEFAULT 'percentage',
  `discountValue` decimal(10,2) NOT NULL,
  `type` varchar(20),
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `usageLimit` int,
  `usageCount` int NOT NULL DEFAULT 0,
  `validFrom` datetime,
  `validUntil` datetime,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Collection Table
-- ============================================

CREATE TABLE `collection` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `image` varchar(255),
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Product Tables
-- ============================================

CREATE TABLE `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `stock` int NOT NULL DEFAULT 0,
  `sku` varchar(255),
  `categoryId` int,
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `featured` tinyint NOT NULL DEFAULT 0,
  `rating` decimal(3,2),
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_sku` (`sku`),
  KEY `FK_categoryId` (`categoryId`),
  CONSTRAINT `FK_product_categoryId` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_image` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` varchar(255) NOT NULL,
  `alt` varchar(255),
  `position` int NOT NULL DEFAULT 0,
  `productId` int NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_productId` (`productId`),
  CONSTRAINT `FK_product_image_productId` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_variant` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2),
  `stock` int,
  `sku` varchar(255),
  `productId` int NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_productId` (`productId`),
  CONSTRAINT `FK_product_variant_productId` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Cart Tables
-- ============================================

CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_userId` (`userId`),
  CONSTRAINT `FK_cart_userId` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cart_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL DEFAULT 1,
  `productId` int NOT NULL,
  `cartId` int NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_productId` (`productId`),
  KEY `FK_cartId` (`cartId`),
  CONSTRAINT `FK_cart_item_cartId` FOREIGN KEY (`cartId`) REFERENCES `cart` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_cart_item_productId` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Order Tables (NOW CREATED AFTER ADDRESS)
-- ============================================

CREATE TABLE `order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `addressId` int,
  `productId` int,
  `productName` varchar(255),
  `quantity` int NOT NULL DEFAULT 1,
  `phone` varchar(20),
  `totalPrice` decimal(10,2) NOT NULL,
  `unitPrice` decimal(10,2),
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `remark` text,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_userId` (`userId`),
  KEY `FK_addressId` (`addressId`),
  CONSTRAINT `FK_order_userId` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_order_addressId` FOREIGN KEY (`addressId`) REFERENCES `address` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `order_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `productId` int NOT NULL,
  `orderId` int NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_productId` (`productId`),
  KEY `FK_orderId` (`orderId`),
  CONSTRAINT `FK_order_item_productId` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_order_item_orderId` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Wishlist Tables
-- ============================================

CREATE TABLE `wishlist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_userId` (`userId`),
  CONSTRAINT `FK_wishlist_userId` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `wishlist_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `wishlistId` int NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_productId` (`productId`),
  KEY `FK_wishlistId` (`wishlistId`),
  CONSTRAINT `FK_wishlist_item_productId` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_wishlist_item_wishlistId` FOREIGN KEY (`wishlistId`) REFERENCES `wishlist` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Payment Tables
-- ============================================

CREATE TABLE `payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transactionNo` varchar(64) NOT NULL,
  `wechatTransactionId` varchar(64),
  `userId` int NOT NULL,
  `orderId` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paymentMethod` varchar(20) NOT NULL DEFAULT 'wechat',
  `status` varchar(20) NOT NULL DEFAULT 'pending',
  `prepayId` varchar(255),
  `wechatResponse` text,
  `callbackData` text,
  `paidAt` datetime,
  `failureReason` text,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_transactionNo` (`transactionNo`),
  KEY `FK_userId` (`userId`),
  KEY `FK_orderId` (`orderId`),
  CONSTRAINT `FK_payment_userId` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_payment_orderId` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX IDX_user_status ON `user`(`status`);
CREATE INDEX IDX_product_status ON `product`(`status`);
CREATE INDEX IDX_product_featured ON `product`(`featured`);
CREATE INDEX IDX_order_status ON `order`(`status`);
CREATE INDEX IDX_order_userId ON `order`(`userId`);
CREATE INDEX IDX_payment_status ON `payment`(`status`);
CREATE INDEX IDX_coupon_code ON `coupon`(`code`);
CREATE INDEX IDX_coupon_status ON `coupon`(`status`);
