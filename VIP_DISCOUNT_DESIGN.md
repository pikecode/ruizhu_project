# VIP充值折扣系统设计方案

## 📋 需求概述

**场景**：用户购买VIP充值产品（会员充值套餐）后，获得相应的折扣权益，在后续购买其他商品时可以使用该折扣。

**核心需求**：
1. Admin可以为VIP产品设置折扣规则
2. 用户购买VIP产品后自动获得折扣权益
3. 用户在结算时可以选择应用折扣
4. 系统需要追踪折扣使用情况

---

## 🏗️ 系统架构设计

### 整体流程图

```
┌─────────────────────────────────────────────────────────────────┐
│                         Admin维护层                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. 创建VIP产品 (productType='vip_recharge')                     │
│  2. 为VIP产品设置折扣规则                                        │
│       ├─ 折扣类型 (百分比/固定金额/倍数)                        │
│       ├─ 折扣值                                                  │
│       ├─ 适用范围 (分类/产品)                                    │
│       ├─ 有效期和使用次数限制                                    │
│       └─ 其他约束条件 (最低消费/最高优惠)                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                         用户购买层                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  用户浏览商城 → 找到VIP产品 → 点击购买                          │
│                    ↓                                              │
│            订单支付成功 (order_paid event)                       │
│                    ↓                                              │
│  系统自动创建 UserVipBenefit 记录                               │
│  (关联 VipDiscountRule，记录购买时间和权益期限)                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                       用户使用层 (结算)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  用户购买商品 → 加入购物车 → 进入结算页面                       │
│                    ↓                                              │
│         查询用户有效的VIP权益列表                                │
│                    ↓                                              │
│   显示可用折扣及预期优惠金额 (给用户选择)                        │
│                    ↓                                              │
│         用户选择折扣 → 计算优惠金额                              │
│                    ↓                                              │
│         支付 → 更新折扣使用次数                                  │
│                    ↓                                              │
│       记录到 DiscountUsageLog                                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 数据模型设计

### 1. VipDiscountRule - 折扣规则表

**存储**：Admin在后台定义的折扣规则。与VIP产品一对一关系。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | PK | 主键 |
| productId | FK | 关联的vip_recharge产品 |
| discountType | enum | `percentage` \| `fixed` \| `multiplier` |
| discountValue | decimal | 折扣值 |
| applicableCategories | json | 适用分类ID数组，null=全部 |
| applicableProducts | json | 适用产品ID数组，null=全部 |
| minPurchaseAmount | bigint | 最低消费金额(分)，null=无限制 |
| maxDiscountAmount | bigint | 最高优惠金额(分)，null=无限制 |
| validDays | int | 有效天数(365天等) |
| usageCountLimit | int | 使用次数限制，null=无限制 |
| description | text | 规则描述 |
| isActive | boolean | 是否启用 |
| createdAt | timestamp | |
| updatedAt | timestamp | |

**示例**：
```json
{
  "productId": 53,
  "discountType": "percentage",
  "discountValue": 90,  // 9折
  "applicableCategories": [1, 2, 3],  // 仅适用于分类1、2、3
  "minPurchaseAmount": 10000,  // 满100元才能使用
  "maxDiscountAmount": 10000,  // 单次最多优惠100元
  "validDays": 365,
  "usageCountLimit": null,  // 无限次使用
  "description": "VIP充值1000元，享受90折优惠"
}
```

### 2. UserVipBenefit - 用户权益表

**存储**：用户购买VIP产品后的权益记录。一个用户可能有多个权益。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | PK | |
| userId | FK | 用户ID |
| productId | FK | 购买的VIP产品ID |
| discountRuleId | FK | 关联的折扣规则 |
| purchaseOrderId | FK | 购买VIP产品的订单ID |
| purchaseAmount | bigint | 充值金额(分) |
| discountType | enum | 从规则复制 |
| discountValue | decimal | 从规则复制 |
| validFrom | timestamp | 权益开始时间 |
| validUntil | timestamp | 权益结束时间 |
| usageCountLimit | int | 使用次数限制，null=无限制 |
| usageRemaining | int | 剩余使用次数，null=无限制 |
| usageCount | int | 已使用次数 |
| isActive | boolean | 权益是否仍有效 |
| createdAt | timestamp | |
| updatedAt | timestamp | |

**示例**：
```json
{
  "userId": "user_123",
  "productId": 53,
  "discountRuleId": 1,
  "purchaseOrderId": "order_456",
  "purchaseAmount": 100000,  // 充值1000元
  "discountType": "percentage",
  "discountValue": 90,
  "validFrom": "2025-11-05",
  "validUntil": "2026-11-05",  // 有效期365天
  "usageCountLimit": null,
  "usageRemaining": null,
  "usageCount": 0,
  "isActive": true
}
```

### 3. DiscountUsageLog - 折扣使用记录表

**存储**：用户每次使用折扣的详细记录。用于审计和分析。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | PK | |
| benefitId | FK | 使用的权益ID |
| orderId | FK | 本次购物的订单ID |
| beforeAmount | bigint | 优惠前订单金额(分) |
| discountAmount | bigint | 实际优惠金额(分) |
| afterAmount | bigint | 优惠后订单金额(分) |
| remark | text | 备注 |
| usedAt | timestamp | 使用时间 |

**示例**：
```json
{
  "benefitId": 10,
  "orderId": "order_789",
  "beforeAmount": 50000,  // 500元
  "discountAmount": 5000,  // 优惠50元(10%)
  "afterAmount": 45000,  // 450元
  "usedAt": "2025-11-06"
}
```

---

## 🎯 折扣类型详解

### 1. percentage - 百分比折扣

用户以设定的折扣率购买商品。

**配置**：`discountType='percentage'`, `discountValue=90`（表示9折）

**计算**：
```
优惠金额 = 订单金额 × (100 - discountValue) / 100
        = 订单金额 × (100 - 90) / 100
        = 订单金额 × 0.1

例：订单金额1000元
优惠 = 1000 × 0.1 = 100元
用户支付 = 900元
```

**约束**：
- `minPurchaseAmount`: 最低消费金额（如满100元才能用）
- `maxDiscountAmount`: 最高优惠金额（如最多优惠100元）

---

### 2. fixed - 固定金额优惠

直接减去固定金额。

**配置**：`discountType='fixed'`, `discountValue=10000`（表示优惠100元）

**计算**：
```
优惠金额 = min(discountValue, 订单金额)
        = min(10000, 订单金额)

例：订单金额500元
优惠 = min(10000, 500) = 500元
用户支付 = 0元（全免）
```

**约束**：
- `minPurchaseAmount`: 最低消费金额（如满100元才能用）

---

### 3. multiplier - 倍数权益

充值的金额可以当N倍使用（如充值1000元，可当2000元购物）。

**配置**：`discountType='multiplier'`, `discountValue=2`（表示2倍使用）

**计算**：
```
用户充值金额 = purchaseAmount = 100000（1000元）
倍数权益 = purchaseAmount × (discountValue - 1)
        = 100000 × (2 - 1)
        = 100000

在结算时：
订单金额 = 500元 = 50000分
可用权益 = min(倍数权益, 50000) = 50000
用户支付 = 0元

如果订单是1500元 = 150000分
可用权益 = min(100000, 150000) = 100000
用户支付 = 150000 - 100000 = 50000（500元）
```

**特点**：这类权益会逐次扣减

---

## 🔄 业务流程细节

### 流程1：Admin创建VIP产品和折扣规则

```
Admin进入后台
  ↓
创建产品
  ├─ name: "VIP充值1000元"
  ├─ productType: "vip_recharge"
  ├─ price: 100000 (1000元)
  ├─ coverImageUrl: "..."
  └─ description: "充值后享受9折优惠"
  ↓
同时配置折扣规则
  ├─ discountType: "percentage"
  ├─ discountValue: 90
  ├─ applicableCategories: [1,2,3]
  ├─ validDays: 365
  ├─ usageCountLimit: null (无限)
  └─ maxDiscountAmount: 10000 (最多优惠100元)
  ↓
保存成功
  ↓
系统自动创建 VipDiscountRule 记录
```

### 流程2：用户购买VIP产品

```
用户浏览商城
  ↓
找到 "VIP充值1000元" 产品
  ↓
点击"购买"
  ↓
支付1000元
  ↓
订单支付成功
  ↓
系统触发 order_paid 事件
  ↓
后端检测 orderItem.product.productType === 'vip_recharge'
  ↓
自动创建 UserVipBenefit 记录
  ├─ userId: "user_123"
  ├─ productId: 53
  ├─ discountRuleId: 1
  ├─ purchaseOrderId: "order_456"
  ├─ purchaseAmount: 100000
  ├─ validFrom: 2025-11-05
  ├─ validUntil: 2026-11-05
  ├─ isActive: true
  └─ usageCount: 0
  ↓
用户获得权益通知
```

### 流程3：用户在结算时使用折扣

```
用户购物加入购物车
  ↓
点击结算
  ↓
前端调用 GET /api/users/my-vip-benefits
  ↓
后端查询满足条件的权益
  ├─ WHERE userId = ?
  ├─ AND isActive = true
  ├─ AND validUntil > NOW()
  ├─ AND (usageRemaining IS NULL OR usageRemaining > 0)
  └─ AND (applicableCategories contains any cartItem.categoryId OR applicableCategories IS NULL)
  ↓
返回可用权益列表
  ├─ benefitId: 10
  ├─ discountType: "percentage"
  ├─ discountValue: 90
  ├─ estimatedDiscount: 5000 (基于购物车计算)
  ├─ usageRemaining: null
  └─ validUntil: 2026-11-05
  ↓
用户界面展示可用折扣
  ├─ "9折优惠"
  ├─ "预计优惠：50元"
  ├─ "有效期至：2026年11月5日"
  └─ [应用此折扣] 按钮
  ↓
用户选择应用折扣
  ↓
前端调用 POST /api/checkout/apply-discount
  ├─ benefitId: 10
  ├─ cartItems: [...]
  └─ totalAmount: 50000
  ↓
后端计算实际优惠
  ├─ 校验权益有效性
  ├─ 校验分类/产品是否适用
  ├─ 校验最低消费、最高优惠
  ├─ 计算最终优惠金额
  └─ 返回 discountAmount: 5000
  ↓
前端展示最终价格
  ├─ 原价：500元
  ├─ 优惠：-50元 (来自VIP折扣)
  └─ 支付：450元
  ↓
用户支付
  ↓
订单创建并支付成功
  ↓
后端记录折扣使用
  ├─ 创建 DiscountUsageLog 记录
  ├─ 更新 UserVipBenefit.usageCount ++
  ├─ 更新 UserVipBenefit.usageRemaining --
  ├─ 如果 usageRemaining == 0 则设置 isActive = false
  └─ 更新 UserVipBenefit.updatedAt
  ↓
交易完成
```

---

## 📡 API设计

### Admin API

#### 1. 创建VIP折扣规则
```
POST /api/admin/vip-discounts/rules
Body: {
  productId: 53,
  discountType: 'percentage',
  discountValue: 90,
  applicableCategories: [1, 2, 3],
  applicableProducts: null,
  minPurchaseAmount: 10000,
  maxDiscountAmount: 10000,
  validDays: 365,
  usageCountLimit: null,
  description: '...'
}
Response: { id: 1, ... }
```

#### 2. 编辑VIP折扣规则
```
PUT /api/admin/vip-discounts/rules/:id
Body: { ... }
```

#### 3. 查看折扣规则
```
GET /api/admin/vip-discounts/rules/:id
GET /api/admin/vip-discounts/rules?isActive=true
```

#### 4. 删除折扣规则
```
DELETE /api/admin/vip-discounts/rules/:id
```

#### 5. 查看用户权益（admin查看某个用户）
```
GET /api/admin/users/:userId/vip-benefits
```

### User API

#### 1. 获取我的VIP权益列表
```
GET /api/users/my-vip-benefits
Response: {
  benefits: [
    {
      id: 10,
      productId: 53,
      productName: 'VIP充值1000元',
      discountType: 'percentage',
      discountValue: 90,
      validUntil: '2026-11-05',
      usageRemaining: null,
      usageCount: 2,
      isActive: true
    }
  ],
  total: 1,
  activeCount: 1
}
```

#### 2. 检查折扣是否可用（预检）
```
POST /api/users/check-discount-available
Body: {
  benefitId: 10,
  cartItems: [...],
  totalAmount: 50000
}
Response: {
  benefitId: 10,
  isAvailable: true,
  estimatedDiscount: 5000
}
```

### Checkout API

#### 1. 应用折扣进行结算
```
POST /api/checkout/apply-discount
Body: {
  benefitId: 10,
  cartItems: [...],
  totalAmount: 50000
}
Response: {
  discountAmount: 5000,
  finalAmount: 45000,
  discountInfo: {
    type: 'percentage',
    value: 90
  }
}
```

#### 2. 提交订单（结算）
```
POST /api/checkout/create-order
Body: {
  cartItems: [...],
  discountBenefitId: 10,  // 可选，应用的折扣
  shippingAddress: {...},
  paymentMethod: 'wechat'
}
Response: {
  orderId: 'order_999',
  totalAmount: 45000,
  discountAmount: 5000,
  ...
}
```

---

## ⚙️ 核心业务逻辑

### 1. 权益激活（purchase_complete事件）

```typescript
// 当订单支付成功时
onOrderPaid(order: Order) {
  for (const item of order.items) {
    if (item.product.productType === 'vip_recharge') {
      // 获取该产品的折扣规则
      const rule = await getVipDiscountRule(item.productId);

      if (rule && rule.isActive) {
        // 创建用户权益
        const benefit = new UserVipBenefit({
          userId: order.userId,
          productId: item.productId,
          discountRuleId: rule.id,
          purchaseOrderId: order.id,
          purchaseAmount: item.amount,
          discountType: rule.discountType,
          discountValue: rule.discountValue,
          validFrom: now(),
          validUntil: now() + rule.validDays天,
          usageCountLimit: rule.usageCountLimit,
          usageRemaining: rule.usageCountLimit,  // 如果有限制
          usageCount: 0,
          isActive: true
        });

        await saveUserVipBenefit(benefit);

        // 发送通知给用户
        await notifyUser(order.userId, `获得VIP权益，有效期至 ${benefit.validUntil}`);
      }
    }
  }
}
```

### 2. 折扣计算

```typescript
function calculateDiscount(
  benefit: UserVipBenefit,
  cartItems: CartItem[],
  totalAmount: number
): number {
  // 检查权益有效性
  if (!benefit.isActive || benefit.validUntil < now()) {
    throw new Error('折扣权益已过期');
  }

  if (benefit.usageRemaining !== null && benefit.usageRemaining <= 0) {
    throw new Error('折扣使用次数已用完');
  }

  // 检查分类/产品限制
  if (!isApplicable(benefit, cartItems)) {
    throw new Error('此折扣不适用于该订单');
  }

  let discountAmount = 0;

  switch (benefit.discountType) {
    case 'percentage':
      discountAmount = totalAmount * (100 - benefit.discountValue) / 100;
      break;

    case 'fixed':
      discountAmount = Math.min(benefit.discountValue, totalAmount);
      break;

    case 'multiplier':
      // 倍数权益：可用金额 = 充值金额 × (倍数 - 1)
      const availableFunds = benefit.purchaseAmount * (benefit.discountValue - 1);
      discountAmount = Math.min(availableFunds, totalAmount);
      break;
  }

  // 应用约束条件
  if (benefit.discountRule.minPurchaseAmount) {
    if (totalAmount < benefit.discountRule.minPurchaseAmount) {
      throw new Error('订单金额未达到最低消费');
    }
  }

  if (benefit.discountRule.maxDiscountAmount) {
    discountAmount = Math.min(discountAmount, benefit.discountRule.maxDiscountAmount);
  }

  return discountAmount;
}
```

### 3. 权益更新（订单支付完成）

```typescript
async function updateBenefitAfterPayment(
  orderId: string,
  benefitId: number,
  discountAmount: number
) {
  // 创建使用记录
  const log = new DiscountUsageLog({
    benefitId,
    orderId,
    beforeAmount: order.totalAmount,
    discountAmount,
    afterAmount: order.totalAmount - discountAmount,
    usedAt: now()
  });

  await saveDiscountUsageLog(log);

  // 更新权益
  const benefit = await getUserVipBenefit(benefitId);
  benefit.usageCount += 1;

  if (benefit.usageRemaining !== null) {
    benefit.usageRemaining -= 1;

    // 如果用完了，标记为无效
    if (benefit.usageRemaining === 0) {
      benefit.isActive = false;
    }
  }

  benefit.updatedAt = now();
  await updateUserVipBenefit(benefit);
}
```

---

## 🛡️ 关键考虑

### 1. 数据一致性

- 权益激活和订单支付必须是原子操作
- 使用数据库事务确保一致性

### 2. 并发控制

- 防止同一权益被多次使用
- 使用乐观锁或悲观锁

### 3. 性能优化

- 在查询用户权益时添加索引：`(userId, isActive, validUntil)`
- 定期清理过期权益的`isActive`标志

### 4. 安全考虑

- 验证用户只能看到自己的权益
- 防止权益被篡改（金额、有效期等）
- 审计所有折扣使用记录

### 5. 用户体验

- 实时展示可用折扣
- 预估优惠金额
- 清晰的有效期提示

---

## 📋 实现清单

### 数据库层
- [ ] 创建 `vip_discount_rules` 表
- [ ] 创建 `user_vip_benefits` 表
- [ ] 创建 `discount_usage_logs` 表
- [ ] 添加必要的索引

### Entity层
- [ ] `VipDiscountRule` entity
- [ ] `UserVipBenefit` entity
- [ ] `DiscountUsageLog` entity

### DTO层
- [ ] `CreateVipDiscountRuleDto`
- [ ] `UpdateVipDiscountRuleDto`
- [ ] `VipDiscountRuleResponseDto`
- [ ] `UserVipBenefitDto`
- [ ] `DiscountUsageLogDto`

### Service层
- [ ] `VipDiscountService` - 管理折扣规则
- [ ] `UserVipBenefitService` - 管理用户权益
- [ ] `DiscountCalculationService` - 计算折扣
- [ ] 事件监听：订单支付完成时激活权益

### Controller层
- [ ] `AdminVipDiscountsController` - Admin API
- [ ] `UserVipBenefitsController` - User API
- [ ] 修改 `CheckoutController` - 支持折扣结算

### 前端（Admin）
- [ ] VIP产品管理页面
- [ ] 折扣规则编辑UI
- [ ] 用户权益查看UI

### 前端（User）
- [ ] 结算页面显示可用折扣
- [ ] 折扣预览功能

---

## ❓ 需要澄清的点

1. **倍数权益**：如果用户充值1000元，当2倍使用，使用后还有剩余，下次购物还能继续用吗？

2. **多个权益**：用户同时有多个VIP权益时，只能用一个还是可以叠加？

3. **退款处理**：用户用了折扣后申请退款，权益是否要回收？

4. **权益过期**：权益过期后，是否需要通知用户？

5. **Admin界面**：是在商品管理页面编辑折扣规则，还是单独的页面？

---

这是完整的设计方案。请评估一下思路是否合理，有什么需要调整或补充的地方。
