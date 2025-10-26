"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistItem = void 0;
const typeorm_1 = require("typeorm");
const wishlist_entity_1 = require("./wishlist.entity");
const product_entity_1 = require("../../products/entities/product.entity");
let WishlistItem = class WishlistItem {
    id;
    wishlistId;
    wishlist;
    productId;
    product;
    createdAt;
};
exports.WishlistItem = WishlistItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], WishlistItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], WishlistItem.prototype, "wishlistId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => wishlist_entity_1.Wishlist, (wishlist) => wishlist.items, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'wishlistId' }),
    __metadata("design:type", wishlist_entity_1.Wishlist)
], WishlistItem.prototype, "wishlist", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], WishlistItem.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product),
    (0, typeorm_1.JoinColumn)({ name: 'productId' }),
    __metadata("design:type", product_entity_1.Product)
], WishlistItem.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], WishlistItem.prototype, "createdAt", void 0);
exports.WishlistItem = WishlistItem = __decorate([
    (0, typeorm_1.Entity)('wishlist_items')
], WishlistItem);
//# sourceMappingURL=wishlist-item.entity.js.map