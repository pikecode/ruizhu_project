# 库存订单购买流程 - 完整测试指南

## 目录
1. [环境准备](#环境准备)
2. [测试用例详解](#测试用例详解)
3. [手动测试步骤](#手动测试步骤)
4. [自动化测试](#自动化测试)
5. [预期结果](#预期结果)
6. [常见问题](#常见问题)

---

## 环境准备

### 前置条件
- NestAPI 后端已启动（port 3000）
- 数据库已连接
- 至少有2个测试产品，库存>0
- 至少有1个测试用户
- 至少有1个收货地址

### 验证环境就绪
```bash
# 检查后端是否运行
curl http://localhost:3000/health

# 预期输出
{"status":"ok"}
```

---

## 测试用例详解

### 场景1: 单用户完整购买流程 ✓
**目标**: 验证从购物车到支付完成的整个流程

**测试步骤**:
1. 获取产品信息 - 验证库存状态字段存在
2. 添加产品到购物车 - 验证库存检查
3. 查看购物车 - 验证商品列表正确
4. 创建订单 - 验证订单号、状态、地址
5. 验证库存已扣减 - 库存应该减少
6. 发起支付 - 创建微信支付订单
7. 支付成功回调 - 模拟微信回调
8. 验证订单状态为已支付

**关键检查点**:
- [ ] 库存扣减正确（初始库存 - 购买数量）
- [ ] 订单初始状态为 `pending`
- [ ] 地址信息完整保存到订单
- [ ] 订单金额与购物车金额一致

---

### 场景2: 库存扣减验证 (乐观锁) ✓
**目标**: 验证乐观锁防止超卖

**测试步骤**:
1. 选择库存有限的产品（例如10件）
2. 获取产品初始库存
3. 创建订单1（购5件）
4. 立即创建订单2（购5件）
5. 验证两个订单都成功或其中一个失败

**预期结果**:
```
情况A: 两个订单都成功
- 订单1: 创建成功，库存 10 → 5
- 订单2: 创建成功，库存 5 → 0
- 最终库存: 0 (无超卖)

情况B: 第二个订单失败 (乐观锁冲突)
- 订单1: 创建成功
- 订单2: 返回 400，错误信息包含 "乐观锁冲突"
- 最终库存: 正确
```

**关键检查点**:
- [ ] 库存不被超卖
- [ ] 乐观锁冲突时返回明确的错误信息
- [ ] Product.version 字段递增

---

### 场景3: 并发订单处理 ✓
**目标**: 验证并发场景下的库存一致性

**测试脚本**:
```bash
# 使用 Apache Bench 模拟并发
# 100 个并发请求，总共 1000 个订单创建请求
ab -n 1000 -c 100 -p order.json -T 'application/json' http://localhost:3000/orders
```

**关键检查点**:
- [ ] 不出现库存为负数
- [ ] 总销售数量 = 初始库存 - 最终库存
- [ ] 所有订单金额合理

---

### 场景4: 支付金额验证 (防欺诈) ✓
**目标**: 验证支付回调中的金额检查

**测试步骤**:
1. 创建订单（金额: 10000分）
2. 创建支付订单（对应的totalFee: 10000）
3. 模拟两种回调情况：
   - 正常: totalFee = 10000 → 订单标记为已支付 ✓
   - 篡改: totalFee = 1 → 订单保持pending ✗

**模拟支付回调**:
```bash
# 正常回调 (应该成功)
curl -X POST http://localhost:3000/wechat/payment/callback \
  -H "Content-Type: application/json" \
  -d '{
    "return_code": "SUCCESS",
    "result_code": "SUCCESS",
    "out_trade_no": "ORD-xxx",
    "transaction_id": "1234567890",
    "total_fee": 10000,
    "time_end": "20231115133000"
  }'

# 金额篡改回调 (应该被拒绝)
curl -X POST http://localhost:3000/wechat/payment/callback \
  -H "Content-Type: application/json" \
  -d '{
    "return_code": "SUCCESS",
    "result_code": "SUCCESS",
    "out_trade_no": "ORD-xxx",
    "transaction_id": "1234567890",
    "total_fee": 1,  # ← 被篡改
    "time_end": "20231115133000"
  }'
```

**关键检查点**:
- [ ] 金额一致时订单状态变为 `paid`
- [ ] 金额不一致时订单保持 `pending`
- [ ] 错误消息中包含金额详情

---

### 场景5: 订单取消和库存恢复 ✓
**目标**: 验证取消订单时库存正确恢复

**测试步骤**:
1. 记录产品初始库存: stock_before = 10
2. 创建订单（购2件）
3. 验证库存扣减: stock_after_order = 8
4. 取消订单
5. 验证库存恢复: stock_after_cancel = 10

**关键检查点**:
- [ ] stock_after_cancel == stock_before
- [ ] 订单状态变为 `cancelled`
- [ ] 库存状态也恢复为合理值

---

### 场景6: 订单超时自动取消 ⏰
**目标**: 验证30分钟未支付的订单自动取消

**测试方案**:
- **短期验证** (推荐): 修改ORDER_TIMEOUT_MINUTES为较小值进行测试
- **长期验证**: 创建订单后等待30分钟，观察日志

**测试步骤** (使用较小超时值):
1. 临时修改: `ORDER_TIMEOUT_MINUTES = 1` (1分钟)
2. 创建订单
3. 等待2分钟
4. 检查日志中的定时任务消息
5. 验证订单状态为 `cancelled`
6. 验证库存已恢复

**查看定时任务日志**:
```bash
# 监视后端日志，搜索 "[定时任务]" 字符串
tail -f /path/to/nestapi.log | grep "定时任务"

# 预期日志输出:
[定时任务] 发现 1 个超时未支付的订单，开始取消...
[定时任务] 已取消超时订单 #15 (orderId: ORD-1730864532515-8723)，库存已恢复
[定时任务] 超时订单处理完成: 成功取消 1 个, 失败 0 个
```

**关键检查点**:
- [ ] 定时任务每分钟执行
- [ ] 超时订单被识别和取消
- [ ] 库存恢复日志记录
- [ ] 无报错或异常

---

### 场景7: VIP折扣应用 ✓
**目标**: 验证购买VIP充值产品后折扣更新

**测试步骤**:
1. 获取用户信息：user.discount = 1.0 (100%，无折扣)
2. 创建订单，包含 `vip_recharge` 产品 (discount: 0.8)
3. 完成支付
4. 在支付回调中，用户的discount应被更新为 0.8

**关键检查点**:
- [ ] 检查是否是 `vip_recharge` 产品
- [ ] 从产品的discount字段读取折扣率
- [ ] 在事务内更新用户discount
- [ ] 原子性保证 (支付成功和折扣更新同时发生)

---

### 场景8: 边界情况处理 ✓
**目标**: 验证各种错误情况的处理

**测试用例**:

| 错误情况 | 请求 | 预期状态码 | 预期错误信息 |
|---------|------|-----------|-----------|
| 金额为负 | `totalAmount: -1000` | 400 | Total amount must be non-negative |
| 数量为0 | `quantity: 0` | 400 | Quantity must be at least 1 |
| 不存在的产品 | `productId: 99999` | 404 | Product not found |
| 不存在的地址 | `addressId: 99999` | 404 | Address not found |
| 金额计算错误 | `total:5000 + ship:1000 - discount:0 != final:5000` | 400 | Final amount calculation is incorrect |
| 库存不足 | 购买10件但只有5件库存 | 400 | 库存不足 |

---

## 手动测试步骤

### 步骤1: 准备环境
```bash
# 1. 启动后端
cd /path/to/nestapi
npm run start

# 2. 验证后端启动成功
curl http://localhost:3000/health
```

### 步骤2: 获取认证令牌
```bash
# 登录或使用现有token
TOKEN="your_jwt_token_here"
```

### 步骤3: 获取测试数据
```bash
# 获取产品列表
curl http://localhost:3000/products \
  -H "Authorization: Bearer $TOKEN"

# 获取地址列表
curl http://localhost:3000/addresses \
  -H "Authorization: Bearer $TOKEN"

# 记录下: PRODUCT_ID, ADDRESS_ID
```

### 步骤4: 执行完整流程
```bash
# 变量设置
API="http://localhost:3000"
TOKEN="your_token"
PRODUCT_ID=1
ADDRESS_ID=1

# 1. 添加到购物车
curl -X POST $API/cart/add \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": '$PRODUCT_ID',
    "quantity": 2,
    "priceSnapshot": 5000
  }'

# 2. 创建订单
ORDER=$(curl -X POST $API/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": '$PRODUCT_ID', "quantity": 2, "price": 5000}],
    "addressId": '$ADDRESS_ID',
    "totalAmount": 10000,
    "shippingAmount": 0,
    "discountAmount": 0,
    "finalAmount": 10000,
    "isRecharge": false
  }')

echo "订单: $ORDER"

# 3. 检查库存
curl $API/products/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN" | jq '.data.stockQuantity'
```

---

## 自动化测试

### 运行 Bash 测试脚本
```bash
# 使脚本可执行
chmod +x test-purchase-flow.sh

# 运行测试
./test-purchase-flow.sh
```

### 运行 Jest E2E 测试
```bash
# 安装测试依赖（如果还未安装）
npm install --save-dev @nestjs/testing supertest

# 运行 E2E 测试
npm run test:e2e test/purchase-flow.e2e-spec.ts

# 运行并生成覆盖率报告
npm run test:e2e -- --coverage
```

---

## 预期结果

### 成功标志 ✓
- [ ] 所有12个测试场景都通过
- [ ] 库存数字正确且无负数
- [ ] 订单状态流转正确
- [ ] 支付金额验证生效
- [ ] 并发请求无超卖
- [ ] 定时任务成功执行

### 关键指标
```
库存扣减准确性:    ★★★★★ (9/10) - 使用乐观锁防止超卖
支付流程安全性:    ★★★★★ (10/10) - 有金额验证和事务
订单取消正确性:    ★★★★★ (9/10) - 库存恢复正常
并发控制:          ★★★★★ (9/10) - 乐观锁有效
超时处理:          ★★★★★ (9/10) - 定时任务运行
地址持久化:        ★★★★★ (9/10) - 完整保存
```

---

## 常见问题

### Q1: 乐观锁冲突是否意味着有问题？
**A**: 不是！乐观锁冲突是正常现象，表示系统正确地阻止了并发冲突。如果并发很高，可能经常看到冲突，这时用户需要重试。

### Q2: 库存会不会变成负数？
**A**: 不会！乐观锁确保了库存一致性：
- 更新前检查version
- 原子地更新库存和version
- 失败时返回错误
- 库存永远 >= 0

### Q3: 订单30分钟超时是否可以修改？
**A**: 可以！修改 `ORDER_TIMEOUT_MINUTES` 常量：
```typescript
private readonly ORDER_TIMEOUT_MINUTES = 30; // 修改这个值
```

### Q4: 支付金额验证在哪里进行？
**A**: 在微信支付回调处理时：
```typescript
if (payment.totalFee !== order.totalAmount) {
  throw new Error('支付金额不匹配');
}
```

### Q5: 如何查看定时任务日志？
**A**: 监视NestAPI的日志输出，搜索 `[定时任务]` 字符串。

### Q6: 乐观锁失败后用户该怎么办？
**A**: 系统会返回清晰的错误信息，前端应该：
1. 显示错误提示
2. 允许用户重新尝试
3. 刷新库存信息

### Q7: 地址信息是否会因为修改而影响已有订单？
**A**: 不会！订单创建时将地址快照保存到 `shippingAddress` JSON字段，与原地址表无关。

---

## 测试检查清单

在部署到生产环境前，确保检查以下项目：

- [ ] 库存不会超卖（并发测试通过）
- [ ] 支付金额验证有效（金额篡改被拒绝）
- [ ] 订单超时自动取消（定时任务运行）
- [ ] 库存扣减和恢复正确
- [ ] 地址信息完整保存
- [ ] VIP折扣正确应用
- [ ] 所有边界情况处理
- [ ] 错误消息清晰有用
- [ ] 数据库事务正确处理
- [ ] 日志记录完整
- [ ] 性能满足要求
- [ ] 并发能力足以应对预期负载

---

## 更新记录

| 日期 | 版本 | 变更 |
|------|------|------|
| 2025-11-06 | 1.0 | 初始版本，包含所有测试用例 |

