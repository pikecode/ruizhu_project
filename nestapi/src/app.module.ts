import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MediaModule } from './modules/media/media.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { ArrayCollectionsModule } from './modules/array-collections/array-collections.module';
import { BannersModule } from './modules/banners/banners.module';
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
    RolesModule,
    CategoriesModule,
    ProductsModule,
    MediaModule,
    CollectionsModule,
    ArrayCollectionsModule,
    BannersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
