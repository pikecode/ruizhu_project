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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const wishlist_entity_1 = require("./entities/wishlist.entity");
const wishlist_item_entity_1 = require("./entities/wishlist-item.entity");
let WishlistsService = class WishlistsService {
    wishlistsRepository;
    wishlistItemsRepository;
    constructor(wishlistsRepository, wishlistItemsRepository) {
        this.wishlistsRepository = wishlistsRepository;
        this.wishlistItemsRepository = wishlistItemsRepository;
    }
    async getOrCreateWishlist(userId) {
        let wishlist = await this.wishlistsRepository.findOne({
            where: { userId },
            relations: ['items', 'items.product'],
        });
        if (!wishlist) {
            wishlist = this.wishlistsRepository.create({ userId });
            wishlist = await this.wishlistsRepository.save(wishlist);
        }
        return wishlist;
    }
    async addToWishlist(userId, productId) {
        const wishlist = await this.getOrCreateWishlist(userId);
        const existingItem = await this.wishlistItemsRepository.findOne({
            where: { wishlistId: wishlist.id, productId },
        });
        if (existingItem) {
            throw new common_1.BadRequestException('产品已在愿望清单中');
        }
        const item = this.wishlistItemsRepository.create({
            wishlist,
            productId,
        });
        return await this.wishlistItemsRepository.save(item);
    }
    async removeFromWishlist(userId, productId) {
        const wishlist = await this.getOrCreateWishlist(userId);
        const item = await this.wishlistItemsRepository.findOne({
            where: { wishlistId: wishlist.id, productId },
        });
        if (!item) {
            throw new common_1.NotFoundException('愿望清单项不存在');
        }
        await this.wishlistItemsRepository.remove(item);
    }
    async getWishlist(userId) {
        return await this.getOrCreateWishlist(userId);
    }
};
exports.WishlistsService = WishlistsService;
exports.WishlistsService = WishlistsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wishlist_entity_1.Wishlist)),
    __param(1, (0, typeorm_1.InjectRepository)(wishlist_item_entity_1.WishlistItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], WishlistsService);
//# sourceMappingURL=wishlists.service.js.map