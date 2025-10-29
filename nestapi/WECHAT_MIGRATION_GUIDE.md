# WeChat Payment & Notification Database Migration Guide

This guide explains how to set up the database tables for WeChat payment and notification features.

## Overview

Two new database tables have been created to support WeChat payment and notification functionality:

1. **wechat_payments** - Stores WeChat payment order information
2. **wechat_notifications** - Stores WeChat push notification records

## Migration Files

The migration files are located in:
```
src/database/migrations/
├── 1729774800000-CreateWechatPaymentsTable.ts
└── 1729774801000-CreateWechatNotificationsTable.ts
```

## Table Structures

### wechat_payments Table

Stores all WeChat payment orders with the following information:

| Column | Type | Description |
|--------|------|-------------|
| id | int | Primary key, auto-increment |
| openid | varchar(100) | WeChat user identifier |
| outTradeNo | varchar(100) | Merchant order number (unique) |
| transactionId | varchar(100) | WeChat transaction ID |
| prepayId | varchar(100) | Prepay session ID from unified order API |
| totalFee | int | Payment amount in cents |
| body | varchar(255) | Order title/description |
| detail | text | Order details |
| notifyUrl | varchar(255) | Callback URL for payment notification |
| status | enum | Payment status: pending, success, failed, cancelled |
| payTime | datetime | Payment completion time |
| metadata | json | Business data (order ID, order type, etc.) |
| paymentMethod | varchar(50) | Payment method: wechat, balance, alipay |
| wechatCallback | json | Complete WeChat API response |
| remark | text | Additional notes |
| createdAt | datetime | Record creation time |
| updatedAt | datetime | Record update time |

**Indexes:**
- `openid` - For user payment queries
- `outTradeNo` - For merchant order lookups
- `transactionId` - For WeChat transaction lookups
- `prepayId` - For prepay ID lookups
- `status` - For payment status filtering
- `createdAt` - For time-based queries

### wechat_notifications Table

Stores all WeChat push notifications sent to users:

| Column | Type | Description |
|--------|------|-------------|
| id | int | Primary key, auto-increment |
| openid | varchar(100) | WeChat user identifier |
| notificationType | enum | Type: template, subscribe, uniform |
| templateId | varchar(100) | Template/message ID |
| title | varchar(255) | Notification title |
| content | text | Notification content |
| data | json | Template variables |
| page | varchar(255) | Target page path |
| status | enum | Status: pending, sent, failed, read |
| businessId | varchar(100) | Related business ID (order, payment, etc.) |
| businessType | varchar(50) | Business type: order, payment, refund, delivery, system |
| msgId | varchar(100) | WeChat message ID |
| wechatResponse | json | WeChat API response |
| errorMessage | text | Failure reason |
| sentAt | datetime | Send time |
| scheduledAt | datetime | Scheduled send time |
| readAt | datetime | User read time |
| retryCount | int | Number of retry attempts |
| maxRetries | int | Maximum retry attempts (default: 3) |
| remark | text | Additional notes |
| createdAt | datetime | Record creation time |
| updatedAt | datetime | Record update time |

**Indexes:**
- `openid` - For user notification queries
- `status` - For status filtering
- `notificationType` - For type filtering
- `businessId` - For business entity lookups
- `businessType` - For business type filtering
- `createdAt` - For time-based queries
- `openid + status` - For combined user-status queries

## Running Migrations

### Using TypeORM CLI

If your project is configured to use TypeORM migrations:

```bash
# Run all pending migrations
npm run typeorm migration:run

# Run specific migration
npm run typeorm migration:run -- src/database/migrations/1729774800000-CreateWechatPaymentsTable.ts
```

### Manual Execution

If you prefer to run the migrations manually on your production server:

```bash
# Connect to MySQL
mysql -h [host] -u [user] -p [database]

# Create wechat_payments table
CREATE TABLE wechat_payments (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  openid VARCHAR(100) NOT NULL COMMENT '用户openId',
  outTradeNo VARCHAR(100) NOT NULL UNIQUE COMMENT '商户订单号',
  transactionId VARCHAR(100) COMMENT '微信支付交易号',
  prepayId VARCHAR(100) COMMENT '预支付ID',
  totalFee INT NOT NULL COMMENT '支付金额（分）',
  body VARCHAR(255) NOT NULL COMMENT '订单标题',
  detail LONGTEXT COMMENT '订单详情',
  notifyUrl VARCHAR(255) COMMENT '回调通知URL',
  status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending',
  payTime DATETIME COMMENT '支付时间',
  metadata JSON COMMENT '业务数据',
  paymentMethod VARCHAR(50) DEFAULT 'wechat',
  wechatCallback JSON COMMENT '微信回调数据',
  remark LONGTEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX IDX_WECHAT_PAYMENTS_OPENID (openid),
  INDEX IDX_WECHAT_PAYMENTS_OUT_TRADE_NO (outTradeNo),
  INDEX IDX_WECHAT_PAYMENTS_TRANSACTION_ID (transactionId),
  INDEX IDX_WECHAT_PAYMENTS_PREPAY_ID (prepayId),
  INDEX IDX_WECHAT_PAYMENTS_STATUS (status),
  INDEX IDX_WECHAT_PAYMENTS_CREATED_AT (createdAt)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create wechat_notifications table
CREATE TABLE wechat_notifications (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  openid VARCHAR(100) NOT NULL COMMENT '用户openId',
  notificationType ENUM('template', 'subscribe', 'uniform') DEFAULT 'subscribe',
  templateId VARCHAR(100) NOT NULL COMMENT '模板ID',
  title VARCHAR(255) NOT NULL COMMENT '消息标题',
  content LONGTEXT NOT NULL COMMENT '消息内容',
  data JSON COMMENT '消息数据',
  page VARCHAR(255) COMMENT '跳转页面',
  status ENUM('pending', 'sent', 'failed', 'read') DEFAULT 'pending',
  businessId VARCHAR(100) COMMENT '业务ID',
  businessType VARCHAR(50) COMMENT '业务类型',
  msgId VARCHAR(100) COMMENT '微信消息ID',
  wechatResponse JSON COMMENT '微信响应',
  errorMessage LONGTEXT COMMENT '错误信息',
  sentAt DATETIME COMMENT '发送时间',
  scheduledAt DATETIME COMMENT '计划发送时间',
  readAt DATETIME COMMENT '读取时间',
  retryCount INT DEFAULT 0,
  maxRetries INT DEFAULT 3,
  remark LONGTEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX IDX_WECHAT_NOTIFICATIONS_OPENID (openid),
  INDEX IDX_WECHAT_NOTIFICATIONS_STATUS (status),
  INDEX IDX_WECHAT_NOTIFICATIONS_TYPE (notificationType),
  INDEX IDX_WECHAT_NOTIFICATIONS_BUSINESS_ID (businessId),
  INDEX IDX_WECHAT_NOTIFICATIONS_BUSINESS_TYPE (businessType),
  INDEX IDX_WECHAT_NOTIFICATIONS_CREATED_AT (createdAt),
  INDEX IDX_WECHAT_NOTIFICATIONS_OPENID_STATUS (openid, status)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Deployment Steps

When deploying the WeChat features to production:

1. **Build the project locally**:
   ```bash
   ./deploy/build.sh
   ```

2. **Create a release package**:
   ```bash
   ./deploy/package.sh
   ```

3. **Deploy to production**:
   ```bash
   ./deploy/deploy.sh
   ```

4. **Run database migrations** on the production server:
   ```bash
   # SSH into production server
   ssh root@your-server

   # Navigate to the app directory
   cd /opt/ruizhu-app/nestapi-dist

   # Run migrations
   npm run typeorm migration:run
   ```

5. **Verify migration success**:
   ```bash
   # Check if tables were created
   mysql -h your-db-host -u root -p your-database \
     -e "SHOW TABLES LIKE 'wechat_%';"

   # Check table structure
   mysql -h your-db-host -u root -p your-database \
     -e "DESCRIBE wechat_payments;"
   ```

## Environment Configuration

Ensure your `.env` file contains the WeChat API credentials:

```
# WeChat Payment Configuration
WECHAT_MCH_ID=your_merchant_id
WECHAT_MCH_KEY=your_merchant_key
WECHAT_PAY_NOTIFY_URL=https://your-domain.com/api/wechat/payment/callback

# WeChat Mini Program Configuration
WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret
```

## API Endpoints

After migrations are complete, the following API endpoints become available:

### Payment Endpoints
- `POST /api/wechat/payment/create-order` - Create a payment order
- `POST /api/wechat/payment/callback` - Handle payment callbacks
- `GET /api/wechat/payment/query-status` - Query payment status
- `POST /api/wechat/payment/refund` - Request refund

### Notification Endpoints
- `POST /api/wechat/notification/send-subscribe` - Send subscription message
- `POST /api/wechat/notification/send-batch` - Batch send notifications
- `GET /api/wechat/notification/records` - Get notification records
- `PUT /api/wechat/notification/mark-read` - Mark notification as read
- `POST /api/wechat/notification/retry-failed` - Retry failed notification

## Troubleshooting

### Migration Fails with "Table already exists"
The tables may already be created. Check if they exist:
```bash
mysql -h your-db-host -u root -p your-database \
  -e "SHOW TABLES LIKE 'wechat_%';"
```

If they exist but the migration still fails, it may be safe to ignore the error or drop and recreate the tables.

### Permission Denied Error
Ensure the database user has the following permissions:
```sql
GRANT CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, SELECT ON your_database.* TO 'your_user'@'%';
FLUSH PRIVILEGES;
```

### Callback URL Not Accessible
Ensure the callback URL configured in WeChat Merchant Dashboard matches:
```
https://your-domain.com/api/wechat/payment/callback
```

## Rollback

If you need to rollback the migrations:

```bash
# Using TypeORM CLI
npm run typeorm migration:revert

# Manual rollback (via MySQL)
mysql -h your-db-host -u root -p your-database << EOF
DROP TABLE IF EXISTS wechat_notifications;
DROP TABLE IF EXISTS wechat_payments;
EOF
```

## Additional Resources

- WeChat Payment API: https://pay.weixin.qq.com/wiki
- WeChat Mini Program Notifications: https://developers.weixin.qq.com/miniprogram/dev/api/notice/
- TypeORM Migration Documentation: https://typeorm.io/migrations

## Support

For issues or questions about the migrations, please refer to the WeChat API documentation or contact the development team.
