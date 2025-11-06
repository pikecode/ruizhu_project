# 快速测试指南 - 库存订单购买流程

## 🚀 5分钟快速测试

### 1. 验证后端启动
```bash
curl http://localhost:3000/health
# 预期: {"status":"ok"}
```

### 2. 获取测试数据
```bash
TOKEN="your_token_here"
PRODUCT_ID=1
ADDRESS_ID=1
```

### 3. 核心测试命令

#### 测试A: 库存扣减
```bash
# 获取初始库存
BEFORE=$(curl -s http://localhost:3000/products/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN" | grep -o '"stockQuantity":[0-9]*' | cut -d: -f2)

# 创建订单
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": '$PRODUCT_ID', "quantity": 2, "price": 5000}],
    "addressId": '$ADDRESS_ID',
    "totalAmount": 10000,
    "finalAmount": 10000
  }'

# 获取最终库存
AFTER=$(curl -s http://localhost:3000/products/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN" | grep -o '"stockQuantity":[0-9]*' | cut -d: -f2)

echo "库存扣减: $BEFORE → $AFTER (扣减: $((BEFORE - AFTER)))"
```

#### 测试B: 库存恢复
```bash
# 获取订单ID (从上一步的响应中)
ORDER_ID=1

# 取消订单
curl -X PUT http://localhost:3000/orders/$ORDER_ID/cancel \
  -H "Authorization: Bearer $TOKEN"

# 检查库存是否恢复
curl http://localhost:3000/products/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN" | grep -o '"stockQuantity":[0-9]*'
```

#### 测试C: 支付金额验证
```bash
# 查看后端代码验证逻辑已存在
grep -n "payment.totalFee" src/modules/wechat/services/wechat-payment.service.ts

# 预期输出: 包含金额匹配检查的代码行
```

#### 测试D: 乐观锁验证
```bash
# 查看version字段已添加
grep -n "version: number" src/entities/product.entity.ts

# 查看乐观锁逻辑
grep -n "version: product.version" src/modules/orders/services/orders.service.ts
```

#### 测试E: 定时任务验证
```bash
# 查看定时任务已注册
grep -n "@Cron" src/modules/orders/services/orders.service.ts

# 预期输出: EVERY_MINUTE 定时任务定义
```

---

## 📊 测试结果对照表

| 测试项 | 检查点 | 成功标志 |
|--------|--------|---------|
| **库存扣减** | 创建订单后库存 = 初始 - 购买数 | ✓ 数字正确 |
| **库存恢复** | 取消订单后库存 = 取消前 | ✓ 数字恢复 |
| **金额验证** | 支付回调中检查 totalFee === totalAmount | ✓ 代码存在 |
| **乐观锁** | Product.version 字段存在且更新 | ✓ 字段存在 |
| **并发防护** | 乐观锁冲突时返回"乐观锁冲突"错误 | ✓ 逻辑正确 |
| **超时取消** | @Cron(EVERY_MINUTE) 定时任务 | ✓ 已实现 |
| **地址保存** | Order.shippingAddress 包含完整信息 | ✓ JSON字段 |

---

## 🔍 常见验证方法

### 方法1: 检查源代码
```bash
# 检查乐观锁是否实现
grep -r "version: product.version" src/

# 检查金额验证是否实现
grep -r "payment.totalFee.*order.totalAmount" src/

# 检查定时任务是否存在
grep -r "@Cron" src/
```

### 方法2: 查看日志输出
```bash
# 监视后端日志中的关键信息
# 1. 库存扣减日志
tail -f /tmp/nestapi.log | grep "库存"

# 2. 定时任务日志
tail -f /tmp/nestapi.log | grep "定时任务"

# 3. 乐观锁冲突日志
tail -f /tmp/nestapi.log | grep "乐观锁\|version"
```

### 方法3: 数据库直接查询
```bash
# 查看Product表的version字段
mysql> SELECT id, name, stockQuantity, version FROM products LIMIT 3;

# 查看Order表的shippingAddress字段
mysql> SELECT id, orderNo, shippingAddress FROM orders LIMIT 3;

# 查看超时订单（需要等待30分钟或修改超时时间）
mysql> SELECT id, orderNo, status, createdAt FROM orders WHERE status='cancelled';
```

---

## ✅ 快速验证清单

在运行完整测试前，快速检查以下项目：

### 代码级别检查
- [ ] `Product.version` 字段已添加 (product.entity.ts:86-87)
- [ ] 乐观锁更新逻辑已实现 (orders.service.ts:129-160)
- [ ] 金额验证已实现 (wechat-payment.service.ts:227-233)
- [ ] 定时任务已实现 (orders.service.ts:655-705)
- [ ] 地址保存已实现 (orders.service.ts:96-110)

### 配置级别检查
- [ ] ScheduleModule 已导入 (app.module.ts:39)
- [ ] @nestjs/schedule 已安装
- [ ] DataSource 已注入到 OrdersService

### 功能级别检查
- [ ] 后端正常启动
- [ ] 数据库连接成功
- [ ] 可以创建订单
- [ ] 库存数值在合理范围内

---

## 🧪 测试执行命令

### 运行所有测试（推荐）
```bash
# 1. 运行 Bash 脚本
chmod +x test-purchase-flow.sh
./test-purchase-flow.sh

# 2. 运行 Jest E2E 测试 (需要安装依赖)
npm run test:e2e test/purchase-flow.e2e-spec.ts
```

### 分别运行单个测试场景
```bash
# 仅测试库存扣减
grep -A 50 "test_inventory_deduction" test-purchase-flow.sh | bash

# 仅测试并发
grep -A 30 "test_concurrent_orders" test-purchase-flow.sh | bash

# 仅测试超时
grep -A 20 "test_timeout_cancellation" test-purchase-flow.sh | bash
```

---

## 📈 预期测试覆盖率

```
├── 库存管理
│   ├── 库存扣减 ✓ (使用乐观锁)
│   ├── 库存恢复 ✓ (订单取消时)
│   ├── 并发防护 ✓ (version字段)
│   └── 超时释放 ✓ (定时任务)
│
├── 订单流程
│   ├── 订单创建 ✓ (包含地址保存)
│   ├── 订单查询 ✓ (完整地址)
│   ├── 订单取消 ✓ (状态转换)
│   └── 订单超时 ✓ (自动处理)
│
├── 支付管理
│   ├── 支付创建 ✓ (金额正确)
│   ├── 金额验证 ✓ (防欺诈)
│   ├── 状态更新 ✓ (事务保护)
│   └── VIP折扣 ✓ (自动应用)
│
└── 数据一致性
    ├── 原子性 ✓ (事务)
    ├── 金额计算 ✓ (验证)
    ├── 地址完整性 ✓ (JSON存储)
    └── 日志记录 ✓ (可追溯)
```

---

## 📝 问题排查

### 问题1: 库存显示不正确
```bash
# 检查
1. 产品是否存在: SELECT * FROM products WHERE id=1;
2. 库存值是否为负: SELECT * FROM products WHERE stockQuantity < 0;
3. version字段是否递增: SELECT id, stockQuantity, version FROM products;
```

### 问题2: 乐观锁冲突过于频繁
```bash
# 可能是高并发场景
# 可以检查是否需要增加重试逻辑或者改进前端流程
```

### 问题3: 定时任务未执行
```bash
# 检查
1. ScheduleModule 是否导入
2. 后端日志中是否有定时任务日志
3. 是否有错误：grep "ERROR\|定时任务" /tmp/nestapi.log
```

### 问题4: 支付金额验证未生效
```bash
# 检查支付回调是否包含正确的金额
# 验证 wechat-payment.service.ts 中的金额检查逻辑
```

---

## 🎯 成功标准

所有以下条件满足时，测试通过 ✓

| 场景 | 成功标准 |
|------|---------|
| 库存扣减 | 库存数字正确，无超卖，无负数 |
| 并发订单 | 100个并发请求后库存=初始值-总销量 |
| 支付验证 | 金额篡改被拒绝，金额一致时接受 |
| 超时取消 | 日志显示定时任务运行，超时订单被取消 |
| 地址保存 | 订单中包含完整的收货地址信息 |
| VIP折扣 | 购买vip_recharge产品后折扣被正确应用 |

---

## 📞 技术支持

遇到问题时，检查以下资源：

1. **详细指南**: 参考 `TEST_GUIDE.md`
2. **代码实现**: 查看 `src/modules/orders/services/orders.service.ts`
3. **测试脚本**: 运行 `test-purchase-flow.sh`
4. **后端日志**: 监视NestAPI的控制台输出

