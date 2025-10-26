"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../users/entities/user.entity");
const role_entity_1 = require("../roles/entities/role.entity");
const file_entity_1 = require("../files/entities/file.entity");
const product_entity_1 = require("../products/entities/product.entity");
const product_image_entity_1 = require("../products/entities/product-image.entity");
const product_variant_entity_1 = require("../products/entities/product-variant.entity");
const category_entity_1 = require("../categories/entities/category.entity");
const cart_entity_1 = require("../carts/entities/cart.entity");
const cart_item_entity_1 = require("../carts/entities/cart-item.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const order_item_entity_1 = require("../orders/entities/order-item.entity");
const wishlist_entity_1 = require("../wishlists/entities/wishlist.entity");
const wishlist_item_entity_1 = require("../wishlists/entities/wishlist-item.entity");
const coupon_entity_1 = require("../coupons/entities/coupon.entity");
const collection_entity_1 = require("../collections/entities/collection.entity");
const address_entity_1 = require("../addresses/entities/address.entity");
const payment_entity_1 = require("../payments/entities/payment.entity");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: (configService) => {
                    const dbUrl = configService.get('DB_URL');
                    const commonConfig = {
                        entities: [
                            user_entity_1.User,
                            role_entity_1.Role,
                            file_entity_1.File,
                            product_entity_1.Product,
                            product_image_entity_1.ProductImage,
                            product_variant_entity_1.ProductVariant,
                            category_entity_1.Category,
                            cart_entity_1.Cart,
                            cart_item_entity_1.CartItem,
                            order_entity_1.Order,
                            order_item_entity_1.OrderItem,
                            wishlist_entity_1.Wishlist,
                            wishlist_item_entity_1.WishlistItem,
                            coupon_entity_1.Coupon,
                            collection_entity_1.Collection,
                            address_entity_1.Address,
                            payment_entity_1.Payment,
                        ],
                        synchronize: false,
                        logging: false,
                    };
                    if (dbUrl) {
                        return {
                            type: 'mysql',
                            url: dbUrl,
                            ...commonConfig,
                        };
                    }
                    return {
                        type: 'mysql',
                        host: configService.get('DB_HOST') || 'localhost',
                        port: configService.get('DB_PORT') || 3306,
                        username: configService.get('DB_USER') || 'root',
                        password: configService.get('DB_PASSWORD') || '',
                        database: configService.get('DB_NAME') || 'ruizhu',
                        ...commonConfig,
                    };
                },
                inject: [config_1.ConfigService],
            }),
        ],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map