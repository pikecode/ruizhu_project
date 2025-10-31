/**
 * 数据库配置文件
 * 支持连接到云数据库（腾讯云 CDB MySQL、阿里云RDS、AWS RDS等）
 *
 * 当前配置: 腾讯云 MySQL (gz-cdb-qtjza6az.sql.tencentcdb.com:27226)
 */

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  Product,
  ProductImage,
  ProductAttribute,
  ProductDetails,
  ProductTag,
  ProductReview,
  Order,
  OrderItem,
  OrderRefund,
  ProductStats,
} from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { Collection } from '../entities/collection.entity';
import { CollectionProduct } from '../entities/collection-product.entity';
import { ArrayCollection } from '../entities/array-collection.entity';
import { ArrayCollectionItem } from '../entities/array-collection-item.entity';
import { ArrayCollectionItemProduct } from '../entities/array-collection-item-product.entity';
import { Banner } from '../entities/banner.entity';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { UserAddress } from '../modules/addresses/entities/user-address.entity';
import { CartItem } from '../modules/cart/entities/cart-item.entity';
import { WechatPaymentEntity } from '../modules/wechat/entities/wechat-payment.entity';
import { WechatNotificationEntity } from '../modules/wechat/entities/wechat-notification.entity';

/**
 * 获取 TypeORM 数据库配置
 * 从环境变量读取云数据库连接信息
 */
export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  // 从环境变量获取配置
  const dbHost = process.env.DB_HOST;
  const dbPort = parseInt(process.env.DB_PORT || '3306', 10);
  const dbUsername = process.env.DB_USER;
  const dbPassword = process.env.DB_PASSWORD;
  const dbDatabase = process.env.DB_NAME;
  const nodeEnv = process.env.NODE_ENV || 'development';

  // 验证必需的环境变量
  if (!dbHost || !dbUsername || !dbPassword || !dbDatabase) {
    console.error('❌ 缺少必需的数据库环境变量');
    console.error('   需要: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    throw new Error(
      '缺少必需的数据库环境变量: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME',
    );
  }

  // 判断是否为腾讯云 MySQL
  const isTencentCloud = dbHost.includes('tencentcdb.com');

  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('  数据库连接配置');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  主机: ${dbHost}`);
  console.log(`  端口: ${dbPort}`);
  console.log(`  用户: ${dbUsername}`);
  console.log(`  数据库: ${dbDatabase}`);
  console.log(`  环境: ${nodeEnv}`);
  if (isTencentCloud) {
    console.log('  类型: 腾讯云 CDB MySQL ✓');
  }
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  const config: TypeOrmModuleOptions = {
    // 数据库类型
    type: 'mysql',

    // 云数据库连接信息
    host: dbHost,
    port: dbPort,
    username: dbUsername,
    password: dbPassword,
    database: dbDatabase,

    // 实体配置
    entities: [
      User,
      UserAddress,
      Role,
      Permission,
      Category,
      Product,
      ProductImage,
      ProductAttribute,
      ProductDetails,
      ProductTag,
      ProductReview,
      ProductStats,
      CartItem,
      Order,
      OrderItem,
      OrderRefund,
      Collection,
      CollectionProduct,
      ArrayCollection,
      ArrayCollectionItem,
      ArrayCollectionItemProduct,
      Banner,
      WechatPaymentEntity,
      WechatNotificationEntity,
    ],

    // 禁用自动同步 - 使用 migration 或手动创建表
    synchronize: false,

    // 根据环境配置日志
    logging: nodeEnv === 'development' ? ['query', 'error'] : ['error'],
    logger: 'advanced-console',

    // 连接池配置
    poolSize: 10,
    maxQueryExecutionTime: 60000, // 60 秒超时

    // 额外配置
    extra: {
      // 连接池设置
      connectionLimit: 20,
      waitForConnections: true,
      enableExitEvent: true,

      // 腾讯云特定配置
      ...(isTencentCloud && {
        // 腾讯云 MySQL 连接参数
        charset: 'utf8mb4',
        // 连接重试
        enableKeepAlive: true,
        keepAliveInitialDelaySeconds: 0,
      }),

      // 超时设置（毫秒）
      connectTimeout: 20000, // 连接超时 20 秒
      acquireTimeout: 30000, // 获取连接超时 30 秒
      idleTimeout: 300000, // 空闲超时 5 分钟
      reapIntervalMillis: 5000, // 连接池检查间隔
    },

    // SSL 配置 - 腾讯云不需要 SSL
    ssl: false,
  };

  return config;
};

/**
 * 阿里云 RDS MySQL 配置示例
 *
 * 环境变量配置:
 * DB_HOST=rm-xxxxx.mysql.rds.aliyuncs.com
 * DB_PORT=3306
 * DB_USER=ruizhu
 * DB_PASSWORD=your_secure_password
 * DB_NAME=ruizhu_ecommerce
 */

/**
 * 腾讯云 MySQL 配置示例
 *
 * 环境变量配置:
 * DB_HOST=xxx.sql.tencentcdb.com
 * DB_PORT=3306
 * DB_USER=root
 * DB_PASSWORD=your_secure_password
 * DB_NAME=ruizhu_ecommerce
 */

/**
 * AWS RDS MySQL 配置示例
 *
 * 环境变量配置:
 * DB_HOST=xxx.xxxxxxx.rds.amazonaws.com
 * DB_PORT=3306
 * DB_USER=admin
 * DB_PASSWORD=your_secure_password
 * DB_NAME=ruizhu_ecommerce
 */

/**
 * 七牛云数据库配置示例
 *
 * 环境变量配置:
 * DB_HOST=xxxxx.qiniu.net
 * DB_PORT=3306
 * DB_USER=root
 * DB_PASSWORD=your_secure_password
 * DB_NAME=ruizhu_ecommerce
 */
