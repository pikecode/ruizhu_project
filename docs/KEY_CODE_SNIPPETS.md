# 会员充值产品 - 关键代码片段参考

## 1. Product 实体 - VIP充值产品定义

**文件**: `/nestapi/src/entities/product.entity.ts`

### 产品类型字段
```typescript
@Column({
  type: 'varchar',
  length: 50,
  default: 'standard',
  name: 'product_type',
})
productType: 'standard' | 'custom' | 'vip_recharge' = 'standard';
// 产品类型: standard(标准产品) custom(私人定制) vip_recharge(会员充值产品)
```

### VIP折扣倍数字段
```typescript
@Column({ 
  type: 'decimal', 
  precision: 5, 
  scale: 2, 
  default: 1.00, 
  name: 'discount' 
})
discount: number; 
// 折扣倍数（仅针对vip_recharge产品），0.01-1.00，默认1.00（无折扣）
```

---

## 2. CreateProductDto - 产品创建验证

**文件**: `/nestapi/src/modules/products/dto/create-product.dto.ts`

```typescript
export class CreateProductDto {
  @IsIn(['standard', 'custom', 'vip_recharge'], { 
    message: '产品类型必须是 standard、custom 或 vip_recharge 之一' 
  })
  productType?: 'standard' | 'custom' | 'vip_recharge';

  @IsNumber()
  @Min(0.01)
  @Max(1.0)
  discount?: number = 1.0; // VIP折扣倍数（仅针对vip_recharge产品）
}
```

---

## 3. 支付回调处理 - 关键逻辑

**文件**: `/nestapi/src/modules/wechat/services/wechat-payment.service.ts`

### 处理微信支付回调（第174-255行）
```typescript
async handlePaymentCallback(
  callbackData: WechatPaymentCallbackDto,
): Promise<void> {
  try {
    // 1. 验证签名
    if (!this.verifyCallbackSign(callbackData)) {
      throw new BadRequestException('回调签名验证失败');
    }

    // 2. 查找对应的支付记录
    const payment = await this.paymentRepository.findOne({
      where: { outTradeNo: callbackData.out_trade_no },
    });

    if (!payment) {
      throw new BadRequestException('找不到对应的支付记录');
    }

    // 3. 更新支付状态
    if (callbackData.result_code === 'SUCCESS') {
      payment.status = 'success';
      payment.transactionId = callbackData.transaction_id || '';

      // 从 metadata 中提取 orderId 和 userId
      const metadata = payment.metadata as any;
      if (metadata && metadata.orderId && metadata.userId) {
        const orderId = metadata.orderId;
        const userId = metadata.userId;

        try {
          // ✓ 更新订单状态为 paid
          await this.ordersService.markOrderAsPaid(userId, orderId, payment.id);
          this.logger.log(
            `订单状态已更新为已支付: orderId=${orderId}, userId=${userId}`,
          );

          // ✓ 应用VIP折扣权益（关键）
          try {
            await this.applyVipDiscountIfApplicable(orderId, userId);
          } catch (discountError) {
            this.logger.error(
              `应用VIP折扣失败: orderId=${orderId}, userId=${userId}`,
            );
          }
        } catch (orderError) {
          this.logger.error(
            `更新订单状态失败: orderId=${orderId}, userId=${userId}`,
          );
        }
      }
    } else {
      payment.status = 'failed';
    }

    payment.wechatCallback = callbackData;
    await this.paymentRepository.save(payment);
  } catch (error) {
    this.logger.error(`处理支付回调出错: ${error.message}`);
    throw new HttpException(
      `处理支付回调失败: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
```

---

## 4. VIP权益应用 - 核心逻辑

**文件**: `/nestapi/src/modules/wechat/services/wechat-payment.service.ts`（第590-657行）

```typescript
private async applyVipDiscountIfApplicable(
  orderId: string,
  userId: string,
): Promise<void> {
  try {
    // 1. 查询订单，获取所有订单项
    const order = await this.orderRepository.findOne({
      where: { id: parseInt(orderId, 10) },
      relations: ['items'],
    });

    if (!order || !order.items || order.items.length === 0) {
      this.logger.debug(
        `订单未找到或无订单项: orderId=${orderId}, userId=${userId}`,
      );
      return;
    }

    // 2. 检查订单中是否有vip_recharge产品
    let vipProductDiscount: number | null = null;

    for (const item of order.items) {
      // 查询产品信息
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      // ✓ 关键判断：检查产品类型和折扣值
      if (
        product &&
        product.productType === 'vip_recharge' &&
        product.discount
      ) {
        vipProductDiscount = product.discount;
        this.logger.log(
          `找到VIP充值产品: productId=${item.productId}, discount=${vipProductDiscount}`,
        );
        break; // 只需找到一个VIP产品
      }
    }

    // 3. 如果找到VIP产品，更新用户的discount字段
    if (vipProductDiscount !== null) {
      const user = await this.userRepository.findOne({
        where: { id: parseInt(userId, 10) },
      });

      if (!user) {
        this.logger.warn(`用户未找到: userId=${userId}`);
        return;
      }

      // ✓ 更新用户VIP折扣
      const oldDiscount = user.discount;
      user.discount = vipProductDiscount;
      await this.userRepository.save(user);

      // ✓ 日志记录
      this.logger.log(
        `用户VIP折扣已更新: userId=${userId}, orderId=${orderId}, oldDiscount=${oldDiscount}, newDiscount=${vipProductDiscount}`,
      );
    }
  } catch (error) {
    this.logger.error(
      `应用VIP折扣时出错: orderId=${orderId}, userId=${userId}, error=${error.message}`,
      error.stack,
    );
    throw error;
  }
}
```

---

## 5. 订单支付标记

**文件**: `/nestapi/src/modules/orders/services/orders.service.ts`（第310-325行）

```typescript
async markOrderAsPaid(
  userId: number,
  orderId: number,
  paymentId?: number,
): Promise<Order> {
  const order = await this.getOrder(userId, orderId);

  if (order.status !== 'pending') {
    throw new BadRequestException('Only pending orders can be marked as paid');
  }

  // 更新订单状态
  order.status = 'paid';  // pending → paid
  order.paidAt = new Date();  // 记录支付时间

  return await this.orderRepository.save(order);
}
```

---

## 6. 前端 - 支付成功后处理

**文件**: `/miniprogram/src/pages/payment/payment.vue`（第210-291行）

```typescript
async confirmPaymentSuccess(outTradeNo) {
  try {
    const openid = uni.getStorageSync('openId');

    // 1. 查询支付状态
    console.log('📡 [Payment] 查询支付状态...')
    const status = await wechatPaymentService.queryPaymentStatus(outTradeNo, openid)

    if (status === 'success') {
      uni.showToast({
        title: '支付成功',
        icon: 'success',
        duration: 1500
      })

      // 2. 从后端刷新最新的订单信息
      try {
        const ordersService = require('../../services/orders').default
        if (this.order && this.order.id) {
          console.log('📡 [Payment] 从后端刷新订单信息...')
          const freshOrder = await ordersService.getOrderDetail(this.order.id)
          if (freshOrder) {
            console.log('✅ [Payment] 订单已从后端刷新:', freshOrder)
          }
        }
      } catch (error) {
        console.warn('⚠️ [Payment] 刷新订单信息失败:', error)
      }

      // 3. 如果订单包含vip_recharge产品，刷新用户信息以获取新的discount
      try {
        if (this.order && this.order.items && this.order.items.length > 0) {
          // ✓ 检查是否包含VIP产品
          const hasVipProduct = this.order.items.some(
            item => item.productType === 'vip_recharge' || item.type === 'vip_recharge'
          )
          
          if (hasVipProduct) {
            console.log('📡 [Payment] 订单包含VIP产品，刷新用户信息...')
            const usersService = require('../../services/users').default
            const freshUserInfo = await usersService.getUserInfo()
            
            if (freshUserInfo) {
              // ✓ 保存新的用户信息到本地存储
              uni.setStorageSync('userInfo', freshUserInfo)
              console.log('✅ [Payment] 用户信息已刷新，discount:', freshUserInfo.discount)
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ [Payment] 刷新用户信息失败:', error)
      }

      // 4. 清除临时缓存
      try {
        uni.removeStorageSync('currentOrder')
        uni.removeStorageSync('buyNowOrder')
        uni.removeStorageSync('checkoutItems')
        console.log('✅ [Payment] 已清除临时缓存')
      } catch (e) {
        console.warn('⚠️ [Payment] 清除缓存出错:', e)
      }

      // 5. 延迟后跳转到首页
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
    }
  } catch (error) {
    console.error('Failed to confirm payment:', error)
  }
}
```

---

## 7. 前端 - 会员权益服务

**文件**: `/miniprogram/src/services/member-benefits.ts`

```typescript
import { api } from './api'

export interface MemberBenefit {
  id: number
  title: string
  subtitle?: string | null
  imageUrl?: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface MemberBenefitResponse {
  code: number
  message: string
  data: MemberBenefit | MemberBenefit[]
}

export const memberBenefitsService = {
  // 获取首页展示的会员礼遇列表（仅启用的）
  async getActiveMemberBenefits(): Promise<MemberBenefit[]> {
    try {
      const response = await api.get<MemberBenefitResponse>('/member-benefits')
      return Array.isArray(response.data) ? response.data : [response.data]
    } catch (error) {
      console.error('Failed to fetch member benefits:', error)
      return []
    }
  },

  // 获取单个会员礼遇详情
  async getMemberBenefitById(id: number): Promise<MemberBenefit | null> {
    try {
      const response = await api.get<MemberBenefitResponse>(`/member-benefits/${id}`)
      return (Array.isArray(response.data) ? response.data[0] : response.data) || null
    } catch (error) {
      console.error(`Failed to fetch member benefit ${id}:`, error)
      return null
    }
  }
}
```

---

## 8. 会员信息保存

**文件**: `/miniprogram/src/pages/membership/join.vue`（第278-350行）

```typescript
async onSave() {
  if (!this.validateForm()) return
  if (this.isSaving) return

  this.isSaving = true
  try {
    const token = uni.getStorageSync('accessToken')
    if (!token) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      this.isSaving = false
      return
    }

    // 构建会员信息数据
    const payload = {
      salutation: this.salutations[this.salutationIndex],
      lastName: this.lastName,
      firstName: this.firstName,
      mobile: this.mobile,
      birthDate: this.getBirthDate(),
      province: this.region[0] || null,
      city: this.region[1] || null,
      district: this.region[2] || null,
      requiredConsent: this.requiredConsent ? 1 : 0,
      marketingConsent: this.marketingConsent ? 1 : 0,
      analysisConsent: this.optionalConsents[0].value ? 1 : 0,
      marketingOptionalConsent: this.optionalConsents[1].value ? 1 : 0
    }

    console.log('保存会员信息，数据:', payload)

    try {
      // 检查是否存在现有的会员信息
      const existingProfile = await api.get('/memberships')

      if (existingProfile && existingProfile.hasProfile) {
        // 更新现有会员信息
        await api.put('/memberships', payload)
        console.log('更新会员信息成功')
      } else {
        // 创建新的会员信息
        await api.post('/memberships', payload)
        console.log('创建会员信息成功')
      }

      uni.showToast({
        title: '会员信息已保存',
        icon: 'success',
        duration: 1500
      })

      setTimeout(() => {
        uni.navigateBack({})
      }, 1500)
    } catch (apiError) {
      console.error('API 请求出错:', apiError)
      uni.showToast({ title: '保存失败，请重试', icon: 'none' })
    }
  } catch (error) {
    console.error('保存会员信息出错:', error)
    uni.showToast({ title: '保存出错，请检查网络', icon: 'none' })
  } finally {
    this.isSaving = false
  }
}
```

---

## 9. 关键数据查询示例

### 查询VIP充值产品
```sql
SELECT * FROM products 
WHERE productType = 'vip_recharge' 
AND isSaleOn = 1 
AND isOutOfStock = 0;
```

### 查询用户VIP折扣
```sql
SELECT id, username, discount, createdAt 
FROM users 
WHERE id = ?;
```

### 查询已支付的订单
```sql
SELECT o.*, p.status FROM orders o
LEFT JOIN payments p ON o.id = p.orderId
WHERE o.userId = ? AND o.status = 'paid'
ORDER BY o.createdAt DESC;
```

### 查询会员权益列表
```sql
SELECT * FROM member_benefits 
WHERE isActive = 1 
ORDER BY sortOrder ASC, createdAt DESC;
```

---

## 10. 常见错误排查

### 错误：支付成功但discount没有更新

**检查点**：
1. 订单中是否确实包含 `productType = 'vip_recharge'` 的产品
2. 微信回调日志是否显示 `applyVipDiscountIfApplicable()` 被调用
3. 后端日志是否显示 `用户VIP折扣已更新` 的记录
4. 数据库中 `users` 表是否有 `discount` 字段

### 调试建议

**后端调试**：
```bash
# 查看微信支付日志
grep "找到VIP充值产品" application.log

# 查看用户discount更新
grep "用户VIP折扣已更新" application.log

# 查看订单和支付状态
SELECT o.id, o.status, p.status FROM orders o
LEFT JOIN payments p ON o.id = p.orderId
WHERE o.userId = ?;
```

**前端调试**：
```javascript
// 检查用户信息中的discount值
const userInfo = uni.getStorageSync('userInfo')
console.log('Current discount:', userInfo.discount)

// 检查订单信息
const order = uni.getStorageSync('currentOrder')
console.log('Order items:', order.items)
```

---

## 11. 测试场景

### 完整支付流程测试

1. **准备阶段**
   - 在数据库创建一个 `productType='vip_recharge'` 的产品
   - 设置合理的 `discount` 值（如0.80）
   - 设置合理的价格（如9999分 = 99.99元）

2. **执行步骤**
   - 用户选择VIP充值产品
   - 加入购物车并提交订单
   - 前端发起微信支付
   - 在微信支付界面完成支付（测试环境可能无法真实支付）

3. **验证步骤**
   - 查看后端日志中是否出现 "订单状态已更新为已支付"
   - 查看后端日志中是否出现 "用户VIP折扣已更新"
   - 查询数据库确认 `users.discount` 已更新
   - 前端验证 `uni.getStorageSync('userInfo').discount` 的值
   - 验证后续订单是否应用了VIP折扣

