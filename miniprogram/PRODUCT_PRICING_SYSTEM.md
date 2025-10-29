# 商品价格系统设计方案

## 一、价格类型与字段设计

### 1.1 四种价格概念

```
原价/市场价  (market_price)  - 商品的原始售价，供参考
销售价      (sale_price)    - 用户实际支付的价格 ⭐重要
成本价      (cost_price)    - 商品成本，用于利润计算
VIP价格     (vip_price)     - 会员专享价格（可选）
```

### 1.2 价格表设计

```sql
CREATE TABLE products (
  id                  INT PRIMARY KEY AUTO_INCREMENT,
  name                VARCHAR(200) NOT NULL,

  -- 价格字段
  market_price        DECIMAL(10, 2),      -- 原价
  sale_price          DECIMAL(10, 2),      -- 现价 ⭐重要
  cost_price          DECIMAL(10, 2),      -- 成本价
  vip_price           DECIMAL(10, 2),      -- VIP价格（可选）

  -- 价格状态
  price_status        TINYINT DEFAULT 1,   -- 1正常 0禁用
  discount_rate       DECIMAL(5, 2),       -- 折扣率（如0.80表示8折）

  created_at          DATETIME,
  updated_at          DATETIME
);
```

### 1.3 价格示例

```
商品：Prada Explore 中号单肩包

市场价 (market_price)：¥2,890  ← 原价，划线显示
销售价 (sale_price)：¥2,490    ← 实际价格，突出显示
成本价 (cost_price)：¥1,200    ← 后台看，用户看不见
VIP价格 (vip_price)：¥2,290    ← VIP专享

折扣信息：
折扣率 = 2490 / 2890 = 0.8617 (86.17折)
优惠额 = 2890 - 2490 = ¥400 (省400元)
利润率 = (2490 - 1200) / 2490 = 51.8%
```

---

## 二、价格状态字段

### 2.1 价格相关的状态

```sql
-- 价格状态表
CREATE TABLE product_price_status (
  id                  INT PRIMARY KEY AUTO_INCREMENT,
  product_id          INT NOT NULL,

  -- 价格可用状态
  price_available     TINYINT DEFAULT 1,   -- 1可用 0禁用

  -- 价格类型
  price_type          VARCHAR(50),         -- 'normal' 正常价格
                                           -- 'promotion' 促销价格
                                           -- 'vip' VIP价格

  -- 有效期
  start_date          DATETIME,            -- 价格有效期开始
  end_date            DATETIME,            -- 价格有效期结束

  -- 状态
  status              VARCHAR(20),         -- 'active' 活跃
                                           -- 'pending' 待生效
                                           -- 'expired' 已过期

  -- 备注
  reason              TEXT,                -- 价格变更原因

  created_at          DATETIME,
  updated_at          DATETIME,

  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 2.2 价格状态示例

```
商品ID | 价格     | 状态       | 开始日期    | 结束日期    | 说明
────────┼──────────┼────────────┼─────────────┼─────────────┼──────────────
1001   | 2890    | active    | 2024-01-01  | NULL        | 正常价格
1001   | 2490    | active    | 2024-08-20  | 2024-08-30  | 七夕特惠
1002   | 5990    | pending   | 2024-09-01  | NULL        | 新品价格待生效
1003   | 1890    | expired   | 2024-07-01  | 2024-08-31  | 已过期的促销价格
```

---

## 三、价格计算逻辑

### 3.1 订单价格计算

```javascript
// 商品总价 = 商品单价 × 数量
const itemTotal = product.sale_price * quantity;

// 订单小计 = 所有商品总价
const subtotal = items.reduce((sum, item) =>
  sum + item.sale_price * item.quantity, 0
);

// 优惠金额 = 优惠券金额 + 会员折扣
const discount = couponAmount + memberDiscount;

// 运费
const shipping = getShippingFee(address);

// 订单总额 = 小计 - 优惠 + 运费
const total = subtotal - discount + shipping;
```

### 3.2 价格展示逻辑

```javascript
// 前端显示价格
function displayPrice(product) {
  const now = new Date();

  // 检查是否有有效的促销价格
  const promotion = product.promotions.find(p =>
    p.start_date <= now && p.end_date >= now
  );

  if (promotion) {
    return {
      marketPrice: product.marketPrice,      // 原价（划线）
      salePrice: promotion.price,            // 促销价（突出显示）
      discount: (promotion.price / product.marketPrice * 100).toFixed(0) + '%',
      save: product.marketPrice - promotion.price
    };
  } else {
    return {
      marketPrice: null,                     // 没有原价
      salePrice: product.salePrice,          // 正常价
      discount: null,
      save: null
    };
  }
}
```

---

## 四、前端UI设计

### 4.1 商品卡片价格显示

```html
<!-- 方式1：有原价的情况（打折商品） -->
<div class="product-card">
  <img src="..." />
  <div class="price-section">
    <span class="market-price">¥2,890</span>  ← 划线（原价）
    <span class="sale-price">¥2,490</span>    ← 红色（现价）
    <span class="discount">省¥400</span>     ← 绿色（省钱）
  </div>
</div>

<!-- 方式2：没有原价的情况（正常商品） -->
<div class="product-card">
  <img src="..." />
  <div class="price-section">
    <span class="sale-price">¥2,890</span>    ← 直接显示价格
  </div>
</div>

<!-- 方式3：有VIP价格的情况 -->
<div class="product-card">
  <img src="..." />
  <div class="price-section">
    <span class="market-price">¥2,890</span>
    <span class="sale-price">¥2,490</span>
    <span class="vip-price">VIP: ¥2,290</span> ← VIP专享
    <span class="discount">省¥600</span>
  </div>
</div>
```

### 4.2 购物车价格计算

```html
<div class="cart">
  <table>
    <thead>
      <tr>
        <th>商品</th>
        <th>单价</th>
        <th>数量</th>
        <th>小计</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Prada Explore单肩包</td>
        <td>¥2,490</td>
        <td>1</td>
        <td>¥2,490</td>
      </tr>
      <tr>
        <td>Prada皮鞋</td>
        <td>¥3,890</td>
        <td>1</td>
        <td>¥3,890</td>
      </tr>
    </tbody>
  </table>

  <div class="summary">
    <div class="row">
      <span>商品小计：</span>
      <span>¥6,380</span>
    </div>
    <div class="row coupon">
      <span>优惠券：</span>
      <span class="discount">-¥100</span>  ← 负数，减少
    </div>
    <div class="row member">
      <span>会员折扣：</span>
      <span class="discount">-¥50</span>
    </div>
    <div class="row shipping">
      <span>运费：</span>
      <span>+¥10</span>  ← 正数，增加
    </div>
    <div class="row total">
      <span>应付总额：</span>
      <span class="price">¥6,240</span>
    </div>
  </div>
</div>
```

---

## 五、后端API设计

### 5.1 获取商品价格API

```
GET /api/products/{id}

响应：
{
  code: 200,
  data: {
    id: 1001,
    name: "Prada Explore单肩包",
    market_price: 2890,        // 原价
    sale_price: 2490,          // 现价
    cost_price: 1200,          // 成本价（后台用）
    vip_price: 2290,           // VIP价格

    // 价格状态
    price_status: "active",    // 活跃
    discount: 0.8617,          // 折扣率

    // 促销信息
    promotion: {
      type: "activity",
      name: "七夕特惠",
      start_date: "2024-08-20",
      end_date: "2024-08-30"
    },

    // 计算字段
    is_on_sale: true,          // 是否在打折
    discount_percentage: "14%", // 优惠百分比
    save_amount: 400           // 节省金额
  }
}
```

### 5.2 结算价格API

```
POST /api/orders/calculate-price

请求：
{
  items: [
    { product_id: 1001, quantity: 1, price: 2490 },
    { product_id: 1002, quantity: 1, price: 3890 }
  ],
  coupon_code: "SUMMER100",  // 优惠券
  user_id: 123,              // 用户ID（用于计算会员折扣）
  address_id: 456            // 地址ID（用于计算运费）
}

响应：
{
  code: 200,
  data: {
    items_total: 6380,         // 商品小计
    coupon_discount: 100,      // 优惠券折扣
    member_discount: 50,       // 会员折扣
    shipping_fee: 10,          // 运费
    final_total: 6240,         // 最终应付

    breakdown: [
      { name: "商品小计", amount: 6380 },
      { name: "优惠券折扣", amount: -100 },
      { name: "会员折扣", amount: -50 },
      { name: "运费", amount: 10 }
    ]
  }
}
```

---

## 六、价格变更与历史记录

### 6.1 价格变更记录表

```sql
CREATE TABLE product_price_history (
  id                  INT PRIMARY KEY AUTO_INCREMENT,
  product_id          INT NOT NULL,

  -- 价格变更
  old_price           DECIMAL(10, 2),
  new_price           DECIMAL(10, 2),

  -- 变更原因
  change_reason       VARCHAR(100),  -- 'promotion'促销 'cost_adjust'成本调整

  -- 操作信息
  changed_by          INT,           -- 操作人ID
  changed_at          DATETIME,

  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (changed_by) REFERENCES admins(id)
);
```

### 6.2 价格变更示例

```
商品ID | 旧价格 | 新价格 | 原因        | 操作人 | 时间
────────┼────────┼────────┼─────────────┼────────┼──────────────────
1001   | 2890  | 2490  | 七夕特惠    | 张三  | 2024-08-20 10:00
1001   | 2490  | 2890  | 活动结束    | 张三  | 2024-08-31 23:59
1002   | 3890  | 3790  | 成本下降    | 李四  | 2024-08-15 14:30
```

---

## 七、价格校验规则

### 7.1 后端校验

```javascript
// 添加或修改商品时的价格校验
function validatePrice(product) {
  const errors = [];

  // 1. 销售价必须小于原价
  if (product.sale_price > product.market_price) {
    errors.push("销售价不能高于原价");
  }

  // 2. 销售价必须大于成本价
  if (product.sale_price <= product.cost_price) {
    errors.push("销售价必须高于成本价");
  }

  // 3. 价格必须大于0
  if (product.sale_price <= 0) {
    errors.push("价格必须大于0");
  }

  // 4. 价格小数不超过2位
  if (!/^\d+(\.\d{1,2})?$/.test(product.sale_price)) {
    errors.push("价格最多只能保留2位小数");
  }

  // 5. VIP价格必须小于销售价
  if (product.vip_price && product.vip_price >= product.sale_price) {
    errors.push("VIP价格必须低于销售价");
  }

  return errors;
}
```

### 7.2 前端校验

```html
<!-- 商品编辑表单 -->
<el-form :model="product" :rules="priceRules">
  <!-- 原价 -->
  <el-form-item label="原价（市场价）" prop="market_price">
    <el-input-number
      v-model="product.market_price"
      :min="0"
      :step="0.01"
      :precision="2"
    />
  </el-form-item>

  <!-- 销售价 -->
  <el-form-item label="销售价" prop="sale_price">
    <el-input-number
      v-model="product.sale_price"
      :min="0"
      :step="0.01"
      :precision="2"
    />
  </el-form-item>

  <!-- 成本价 -->
  <el-form-item label="成本价" prop="cost_price">
    <el-input-number
      v-model="product.cost_price"
      :min="0"
      :step="0.01"
      :precision="2"
    />
  </el-form-item>
</el-form>

<script>
const priceRules = {
  market_price: [
    { required: true, message: '原价必填' },
    { type: 'number', message: '必须是数字' }
  ],
  sale_price: [
    { required: true, message: '销售价必填' },
    { type: 'number', message: '必须是数字' },
    {
      validator: (rule, value, callback) => {
        if (value > product.market_price) {
          callback(new Error('销售价不能高于原价'));
        } else {
          callback();
        }
      }
    }
  ],
  cost_price: [
    { required: true, message: '成本价必填' },
    { type: 'number', message: '必须是数字' }
  ]
};
</script>
```

---

## 八、特殊场景处理

### 8.1 促销价格

```javascript
// 获取有效的促销价格
function getActivePrice(product) {
  const now = new Date();

  // 查找所有有效的促销
  const activePromotions = product.promotions.filter(p =>
    p.start_date <= now && p.end_date >= now && p.is_active
  );

  // 如果有多个促销，选择折扣最大的
  if (activePromotions.length > 0) {
    const bestPromotion = activePromotions.reduce((best, current) =>
      current.price < best.price ? current : best
    );
    return {
      price: bestPromotion.price,
      promotion: bestPromotion.name
    };
  }

  return {
    price: product.sale_price,
    promotion: null
  };
}
```

### 8.2 会员价格

```javascript
// 根据会员等级计算价格
function getMemberPrice(product, userLevel) {
  const memberDiscounts = {
    'normal': 1.0,      // 普通用户：无折扣
    'silver': 0.95,     // 银卡：95折
    'gold': 0.90,       // 金卡：90折
    'platinum': 0.85    // 铂金卡：85折
  };

  const salePrice = product.sale_price;
  const discountRate = memberDiscounts[userLevel] || 1.0;

  return Math.round(salePrice * discountRate * 100) / 100;
}
```

### 8.3 库存时的价格处理

```javascript
// 商品库存不足时的处理
function handleLowStock(product) {
  if (product.stock < 10) {
    // 库存少于10件，不参加促销，恢复原价
    product.promotion_price = null;
    product.is_promotion = false;
    product.price = product.sale_price;
  }
}
```

---

## 九、总结

### 价格字段一览表

| 字段 | 含义 | 示例 | 谁看 | 用途 |
|------|------|------|------|------|
| market_price | 原价 | ¥2,890 | 用户+后台 | 显示原价、计算折扣 |
| sale_price | 现价 | ¥2,490 | 用户+后台 | 实际交易价格 ⭐ |
| cost_price | 成本价 | ¥1,200 | 仅后台 | 计算利润、成本管理 |
| vip_price | VIP价 | ¥2,290 | 用户+后台 | VIP专享优惠 |
| discount_rate | 折扣率 | 0.8617 | 后台 | 价格折扣计算 |

### 价格状态一览表

| 状态 | 含义 | 说明 |
|------|------|------|
| active | 活跃 | 正在使用中 |
| pending | 待生效 | 未来生效 |
| expired | 已过期 | 历史价格 |
| inactive | 禁用 | 不使用 |

---

## 实施建议

```
第1步：基础字段设计
□ products表添加：market_price、sale_price、cost_price、vip_price

第2步：价格历史跟踪
□ 创建price_history表记录所有价格变更

第3步：促销价格支持
□ 创建promotions表支持按时间段设置不同价格

第4步：会员价格支持
□ 创建member_prices表支持不同等级的会员价格

第5步：结算系统
□ 实现订单结算API，支持优惠券、会员折扣、运费等计算

第6步：前端展示
□ 商品详情页、购物车、订单确认等处正确展示价格
```
