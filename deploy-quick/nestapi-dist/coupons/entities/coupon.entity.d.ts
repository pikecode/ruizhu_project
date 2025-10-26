export declare enum CouponType {
    FIXED = "fixed",
    PERCENTAGE = "percentage",
    FREE_SHIPPING = "free_shipping"
}
export declare class Coupon {
    id: number;
    code: string;
    description: string;
    type: CouponType;
    discount: number;
    minOrderAmount: number;
    maxDiscount: number;
    usageLimit: number;
    usageCount: number;
    usagePerUser: number;
    validFrom: Date;
    validUntil: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
