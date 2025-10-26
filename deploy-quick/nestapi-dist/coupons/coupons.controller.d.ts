import { CouponsService } from './coupons.service';
export declare class CouponsController {
    private readonly couponsService;
    constructor(couponsService: CouponsService);
    validateCoupon(body: {
        code: string;
        orderAmount: number;
    }): unknown;
    getAvailableCoupons(orderAmount: number): unknown;
}
