import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';
export declare enum CouponType {
    FIXED = "fixed",
    PERCENTAGE = "percentage",
    FREE_SHIPPING = "free_shipping"
}
export declare class CouponsService {
    private couponsRepository;
    constructor(couponsRepository: Repository<Coupon>);
    validateCoupon(code: string, orderAmount: number): unknown;
    getAvailableCoupons(orderAmount: number): unknown;
    incrementUsage(couponId: number): any;
}
