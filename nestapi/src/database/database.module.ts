import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
// Users & Auth
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../auth/entities/permission.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { LoginLog } from '../auth/entities/login-log.entity';
// Files
import { File } from '../files/entities/file.entity';
// Products
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';
// Categories
import { Category } from '../categories/entities/category.entity';
// Carts
import { Cart } from '../carts/entities/cart.entity';
import { CartItem } from '../carts/entities/cart-item.entity';
// Orders
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
// Wishlists
import { Wishlist } from '../wishlists/entities/wishlist.entity';
import { WishlistItem } from '../wishlists/entities/wishlist-item.entity';
// Coupons
import { Coupon } from '../coupons/entities/coupon.entity';
// Collections
import { Collection } from '../collections/entities/collection.entity';
// Addresses & Payments
import { Address } from '../addresses/entities/address.entity';
import { Payment } from '../payments/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DB_URL');
        const commonConfig = {
          entities: [
            // Users & Auth
            User,
            Role,
            Permission,
            RefreshToken,
            LoginLog,
            // Files
            File,
            // Products
            Product,
            ProductImage,
            ProductVariant,
            // Categories
            Category,
            // Carts
            Cart,
            CartItem,
            // Orders
            Order,
            OrderItem,
            // Wishlists
            Wishlist,
            WishlistItem,
            // Coupons
            Coupon,
            // Collections
            Collection,
            // Addresses & Payments
            Address,
            Payment,
          ],
          synchronize: false,  // 禁用自动同步，避免 FK 冲突
          logging: true,  // 启用日志查看 SQL 执行
        };

        // Use URL connection string if available
        if (dbUrl) {
          return {
            type: 'mysql',
            url: dbUrl,
            ...commonConfig,
          };
        }

        // Fall back to individual connection parameters
        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST') || 'localhost',
          port: configService.get<number>('DB_PORT') || 3306,
          username: configService.get<string>('DB_USER') || 'root',
          password: configService.get<string>('DB_PASSWORD') || '',
          database: configService.get<string>('DB_NAME') || 'ruizhu',
          ...commonConfig,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
