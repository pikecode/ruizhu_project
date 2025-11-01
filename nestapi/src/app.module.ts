import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { RolesModule } from './roles/roles.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MediaModule } from './modules/media/media.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { ArrayCollectionsModule } from './modules/array-collections/array-collections.module';
import { BannersModule } from './modules/banners/banners.module';
import { NewsModule } from './modules/news/news.module';
import { WechatModule } from './modules/wechat/wechat.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { AuthorizationsModule } from './modules/authorizations/authorizations.module';
import { MembershipsModule } from './modules/memberships/memberships.module';
import { WishlistsModule } from './modules/wishlists/wishlists.module';
import { getDatabaseConfig } from './database/database.config';

@Module({
  imports: [
    // 全局配置模块 - 从 .env 读取环境变量
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM 数据库连接 - 仅连接云数据库
    TypeOrmModule.forRoot(getDatabaseConfig()),

    // 业务模块
    AuthModule,
    UsersModule,
    AdminUsersModule, // Admin 系统用户管理模块
    RolesModule,
    CategoriesModule,
    ProductsModule,
    MediaModule,
    CollectionsModule,
    ArrayCollectionsModule,
    BannersModule,
    NewsModule,
    WechatModule, // 微信集成模块（支付、通知、登录）
    CartModule, // 购物车模块
    OrdersModule, // 订单模块
    AddressesModule, // 地址管理模块
    CheckoutModule, // 结账模块（集成购物车、订单、地址）
    AuthorizationsModule, // 个人信息授权模块
    MembershipsModule, // 会员信息管理模块
    WishlistsModule, // 心愿单（收藏）模块
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
