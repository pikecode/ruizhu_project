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
exports.CartsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cart_entity_1 = require("./entities/cart.entity");
const cart_item_entity_1 = require("./entities/cart-item.entity");
const product_entity_1 = require("../products/entities/product.entity");
let CartsService = class CartsService {
    cartsRepository;
    cartItemsRepository;
    productsRepository;
    constructor(cartsRepository, cartItemsRepository, productsRepository) {
        this.cartsRepository = cartsRepository;
        this.cartItemsRepository = cartItemsRepository;
        this.productsRepository = productsRepository;
    }
    async getOrCreateCart(userId) {
        let cart = await this.cartsRepository.findOne({
            where: { userId },
            relations: ['items', 'items.product'],
        });
        if (!cart) {
            cart = this.cartsRepository.create({ userId });
            cart = await this.cartsRepository.save(cart);
        }
        return cart;
    }
    async addItem(userId, addToCartDto) {
        const cart = await this.getOrCreateCart(userId);
        const product = await this.productsRepository.findOne({
            where: { id: addToCartDto.productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('产品不存在');
        }
        const existingItem = await this.cartItemsRepository.findOne({
            where: {
                cartId: cart.id,
                productId: addToCartDto.productId,
                selectedColor: addToCartDto.selectedColor,
                selectedSize: addToCartDto.selectedSize,
            },
        });
        if (existingItem) {
            existingItem.quantity += addToCartDto.quantity;
            return await this.cartItemsRepository.save(existingItem);
        }
        const cartItem = this.cartItemsRepository.create({
            cart,
            product,
            quantity: addToCartDto.quantity,
            selectedColor: addToCartDto.selectedColor,
            selectedSize: addToCartDto.selectedSize,
            price: product.price,
        });
        return await this.cartItemsRepository.save(cartItem);
    }
    async updateItem(userId, itemId, updateCartItemDto) {
        const cart = await this.getOrCreateCart(userId);
        const item = await this.cartItemsRepository.findOne({
            where: { id: itemId, cartId: cart.id },
        });
        if (!item) {
            throw new common_1.NotFoundException('购物车项不存在');
        }
        Object.assign(item, updateCartItemDto);
        return await this.cartItemsRepository.save(item);
    }
    async removeItem(userId, itemId) {
        const cart = await this.getOrCreateCart(userId);
        const item = await this.cartItemsRepository.findOne({
            where: { id: itemId, cartId: cart.id },
        });
        if (!item) {
            throw new common_1.NotFoundException('购物车项不存在');
        }
        await this.cartItemsRepository.remove(item);
    }
    async getCart(userId) {
        return await this.getOrCreateCart(userId);
    }
    async clearCart(userId) {
        const cart = await this.getOrCreateCart(userId);
        await this.cartItemsRepository.delete({ cartId: cart.id });
    }
    async calculateTotal(userId) {
        const cart = await this.cartsRepository.findOne({
            where: { userId },
            relations: ['items'],
        });
        if (!cart)
            return 0;
        return cart.items.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);
    }
};
exports.CartsService = CartsService;
exports.CartsService = CartsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_entity_1.Cart)),
    __param(1, (0, typeorm_1.InjectRepository)(cart_item_entity_1.CartItem)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CartsService);
//# sourceMappingURL=carts.service.js.map