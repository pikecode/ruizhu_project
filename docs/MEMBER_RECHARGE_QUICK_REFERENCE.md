# 会员充值产品 - 快速参考指南

## 核心流程概览

```
用户选择VIP充值产品
    ↓
加入购物车 → 结算（应用VIP折扣）
    ↓
生成订单（状态: pending）
    ↓
前端发起微信支付
    ↓
微信回调后端支付成功
    ↓
后端更新订单状态为 paid
    ↓
后端应用VIP权益（更新 user.discount）
    ↓
前端刷新用户信息以获取新的折扣值
    ↓
用户享受VIP权益（后续购物时自动应用折扣）
```

---

## 关键文件位置

### 后端
| 功能 | 文件位置 |
|-----|--------|
| VIP充值产品定义 | `/nestapi/src/entities/product.entity.ts` |
| 产品创建DTO | `/nestapi/src/modules/products/dto/create-product.dto.ts` |
| 会员信息实体 | `/nestapi/src/modules/memberships/entities/membership.entity.ts` |
| 会员权益实体 | `/nestapi/src/entities/member-benefit.entity.ts` |
| 支付实体 | `/nestapi/src/payments/entities/payment.entity.ts` |
| 微信支付服务 | `/nestapi/src/modules/wechat/services/wechat-payment.service.ts` |
| 订单服务 | `/nestapi/src/modules/orders/services/orders.service.ts` |

### 前端
| 功能 | 文件位置 |
|-----|--------|
| 会员信息页面 | `/miniprogram/src/pages/membership/join.vue` |
| 支付页面 | `/miniprogram/src/pages/payment/payment.vue` |
| 会员权益服务 | `/miniprogram/src/services/member-benefits.ts` |

---

## 关键数据字段

### 产品表 (products)
```typescript
productType: 'vip_recharge'    // 标识这是VIP充值产品
discount: 0.80                 // VIP折扣倍数（0.01-1.00）
currentPrice: 9999             // 产品现价（分为单位）
```

### 用户表 (users)
```typescript
discount: 0.80                 // 用户当前享受的VIP折扣倍数
                               // 购买VIP产品后由后端自动更新
```

### 订单表 (orders)
```typescript
items: [                       // 订单中的商品列表
  {
    productId: 123,
    quantity: 1,
    price: 9999                // 商品价格
  }
]
totalAmount: 7999              // 应用折扣后的总额 = 9999 * 0.80
finalAmount: 7999              // 最终应付金额
status: 'paid'                 // 支付完成后变为 'paid'
```

---

## 支付流程关键步骤

### 1. 后端：创建支付订单
```typescript
// 文件: wechat-payment.service.ts
async createUnifiedOrder(dto) {
  // - 验证金额
  // - 生成交易流水号
  // - 计算MD5签名
  // - 调用微信统一下单API
  // - 保存支付记录到数据库
  // - 返回预支付ID和客户端签名
}
```

### 2. 前端：调起微信支付
```typescript
// 文件: payment.vue
wx.requestPayment({
  prepayId: paymentData.prepayId,
  paySign: paymentData.paySign,
  // ... 其他参数
})
```

### 3. 后端：处理微信回调
```typescript
// 文件: wechat-payment.service.ts
async handlePaymentCallback(callbackData) {
  // ✓ 验证签名
  // ✓ 更新支付状态为 'success'
  // ✓ 调用 markOrderAsPaid() 更新订单状态
  // ✓ 调用 applyVipDiscountIfApplicable() 应用VIP权益
}
```

### 4. VIP权益应用（关键逻辑）
```typescript
private async applyVipDiscountIfApplicable(orderId, userId) {
  // 1. 查询订单和订单项
  // 2. 遍历订单项，查找是否有 productType === 'vip_recharge'
  // 3. 获取该产品的 discount 值
  // 4. 更新用户的 discount 字段
  // 5. 日志记录: "用户VIP折扣已更新: userId=xxx, oldDiscount=1.0, newDiscount=0.8"
}
```

### 5. 前端：确认支付成功
```typescript
// 文件: payment.vue
async confirmPaymentSuccess(outTradeNo) {
  // ✓ 查询支付状态
  // ✓ 刷新订单信息
  // ✓ 检查订单中是否有 vip_recharge 产品
  // ✓ 如果有，刷新用户信息以获取新的 discount 值
  // ✓ 清除临时缓存
  // ✓ 跳转到首页
}
```

---

## VIP权益使用

### 权益值说明
```
1.00  →  无折扣（100%原价）
0.90  →  9折优惠
0.80  →  8折优惠
0.70  →  7折优惠
0.50  →  5折优惠
```

### 使用场景
1. **下单时自动应用**：当用户选择商品时，如果 user.discount < 1.0，则自动计算折扣价
2. **订单展示**：订单列表和详情页显示VIP折扣标签
3. **统计分析**：计算用户因VIP享受的总优惠额

---

## 常见问题排查

### Q1: 支付成功但用户discount没有更新？
检查清单：
- [ ] 订单中确实包含 productType === 'vip_recharge' 的产品
- [ ] 微信支付回调已正确接收
- [ ] applyVipDiscountIfApplicable() 是否被调用
- [ ] 数据库中 users 表是否有 discount 字段

### Q2: VIP折扣没有应用到订单？
检查清单：
- [ ] 产品的 productType 是否设置为 'vip_recharge'
- [ ] 产品的 discount 字段值是否正确（0.01-1.00）
- [ ] 订单创建时是否读取了 user.discount
- [ ] 下单时是否应用了VIP折扣计算

### Q3: 会员权益列表显示为空？
检查清单：
- [ ] member_benefits 表中是否有数据
- [ ] 数据的 isActive 字段是否为 true
- [ ] API 是否正确返回数据
- [ ] 前端 memberBenefitsService.getActiveMemberBenefits() 是否被调用

---

## API 端点速查

```bash
# 会员权益
GET  /api/v1/member-benefits              # 获取启用的权益列表
GET  /api/v1/member-benefits/:id          # 获取权益详情

# 会员信息
GET  /api/v1/memberships                  # 获取会员信息
POST /api/v1/memberships                  # 创建会员信息
PUT  /api/v1/memberships                  # 更新会员信息

# 支付
POST /api/v1/wechat/pay/unifiedorder      # 创建支付订单
POST /api/v1/wechat/pay/callback          # 微信回调（异步）
POST /api/v1/wechat/pay/query-order       # 查询支付状态
POST /api/v1/wechat/pay/refund            # 发起退款

# 订单
POST /api/v1/orders                       # 创建订单
GET  /api/v1/orders                       # 获取订单列表
GET  /api/v1/orders/:id                   # 获取订单详情
PUT  /api/v1/orders/:id                   # 更新订单
```

---

## 日志记录关键点

后端会输出以下日志来帮助调试：
```
[支付] 创建支付订单: outTradeNo=ORD-xxx, totalFee=7999分
[支付] 微信支付回调: transaction_id=xxx, amount=7999
[订单] 订单已标记为已支付: orderId=123, userId=456
[VIP] 找到VIP充值产品: productId=789, discount=0.80
[VIP] 用户VIP折扣已更新: userId=456, oldDiscount=1.0, newDiscount=0.80
```

---

## 开发建议

1. **测试VIP流程**：
   - 创建一个 productType='vip_recharge' 的产品
   - 设置合理的 discount 值（如 0.80）
   - 生成订单并完成支付
   - 验证后端日志输出和用户discount更新

2. **前端验证**：
   - 支付成功后检查 uni.getStorageSync('userInfo') 中的 discount 值
   - 验证后续订单是否自动应用了VIP折扣

3. **数据库检查**：
   - `SELECT * FROM users WHERE id=xxx;` 查看 discount 字段
   - `SELECT * FROM member_benefits WHERE isActive=1;` 查看权益列表

---

## 下一步开发计划

- [ ] 添加用户discount字段迁移脚本
- [ ] 完善VIP权益展示页面设计
- [ ] 实现权益过期机制（可选）
- [ ] 添加权益使用日志
- [ ] 后台管理权益编辑功能
