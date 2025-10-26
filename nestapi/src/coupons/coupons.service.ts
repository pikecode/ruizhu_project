import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from './entities/coupon.entity';

export enum CouponType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
  FREE_SHIPPING = 'free_shipping',
}

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponsRepository: Repository<Coupon>,
  ) {}

  async validateCoupon(code: string, orderAmount: number) {
    const coupon = await this.couponsRepository.findOne({
      where: { code, isActive: true },
    });

    if (!coupon) {
      throw new BadRequestException('优惠券无效');
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      throw new BadRequestException('优惠券已过期');
    }

    if (coupon.usageCount >= coupon.usageLimit) {
      throw new BadRequestException('优惠券已用尽');
    }

    if (orderAmount < coupon.minOrderAmount) {
      throw new BadRequestException(
        `最小订单金额为 ${coupon.minOrderAmount}`,
      );
    }

    let discountAmount = 0;

    if (coupon.type === CouponType.FIXED) {
      discountAmount = coupon.discount;
    } else if (coupon.type === CouponType.PERCENTAGE) {
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

  async getAvailableCoupons(orderAmount: number) {
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

  async incrementUsage(couponId: number) {
    await this.couponsRepository.increment({ id: couponId }, 'usageCount', 1);
  }
}
