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
exports.CouponsService = exports.CouponType = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const coupon_entity_1 = require("./entities/coupon.entity");
var CouponType;
(function (CouponType) {
    CouponType["FIXED"] = "fixed";
    CouponType["PERCENTAGE"] = "percentage";
    CouponType["FREE_SHIPPING"] = "free_shipping";
})(CouponType || (exports.CouponType = CouponType = {}));
let CouponsService = class CouponsService {
    couponsRepository;
    constructor(couponsRepository) {
        this.couponsRepository = couponsRepository;
    }
    async validateCoupon(code, orderAmount) {
        const coupon = await this.couponsRepository.findOne({
            where: { code, isActive: true },
        });
        if (!coupon) {
            throw new common_1.BadRequestException('优惠券无效');
        }
        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validUntil) {
            throw new common_1.BadRequestException('优惠券已过期');
        }
        if (coupon.usageCount >= coupon.usageLimit) {
            throw new common_1.BadRequestException('优惠券已用尽');
        }
        if (orderAmount < coupon.minOrderAmount) {
            throw new common_1.BadRequestException(`最小订单金额为 ${coupon.minOrderAmount}`);
        }
        let discountAmount = 0;
        if (coupon.type === CouponType.FIXED) {
            discountAmount = coupon.discount;
        }
        else if (coupon.type === CouponType.PERCENTAGE) {
            discountAmount = (orderAmount * coupon.discount) / 100;
            if (coupon.maxDiscount) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscount);
            }
        }
        return {
            id: coupon.id,
            code: coupon.code,
            type: coupon.type,
            discount: coupon.discount,
            discountAmount: Math.round(discountAmount * 100) / 100,
            finalAmount: Math.round((orderAmount - discountAmount) * 100) / 100,
        };
    }
    async getAvailableCoupons(orderAmount) {
        const now = new Date();
        return await this.couponsRepository
            .createQueryBuilder('coupon')
            .where('coupon.isActive = :active', { active: true })
            .andWhere('coupon.validFrom <= :now', { now })
            .andWhere('coupon.validUntil >= :now', { now })
            .andWhere('coupon.minOrderAmount <= :amount', { amount: orderAmount })
            .andWhere('coupon.usageCount < coupon.usageLimit')
            .getMany();
    }
    async incrementUsage(couponId) {
        await this.couponsRepository.increment({ id: couponId }, 'usageCount', 1);
    }
};
exports.CouponsService = CouponsService;
exports.CouponsService = CouponsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coupon_entity_1.Coupon)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CouponsService);
//# sourceMappingURL=coupons.service.js.map