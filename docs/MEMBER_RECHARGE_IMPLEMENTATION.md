# 会员充值产品实现总结

## 1. 后端数据库实体和模型定义

### 1.1 会员充值产品 - Product 实体
**文件**: `/Users/peakom/work/ruizhu_project/nestapi/src/entities/product.entity.ts`

#### 核心字段:
```typescript
@Entity('products')
export class Product {
  @Column({
    type: 'varchar',
    length: 50,
    default: 'standard',
    name: 'product_type',
  })
  productType: 'standard' | 'custom' | 'vip_recharge' = 'standard';
  // 产品类型: standard(标准产品) custom(私人定制) vip_recharge(会员充值产品)

  // VIP折扣相关
  @Column({ 
    type: 'decimal', 
    precision: 5, 
    scale: 2, 
    default: 1.00, 
    name: 'discount' 
  })
  discount: number; 
  // 折扣倍数（仅针对vip_recharge产品），0.01-1.00，默认1.00（无折扣）
  
  // 价格信息
  @Column({ type: 'int', nullable: true, name: 'original_price' })
  originalPrice: number | null; // 原价（分为单位）

  @Column({ type: 'int', nullable: true, name: 'current_price' })
  currentPrice: number | null; // 现价（分为单位）

  @Column({ type: 'tinyint', default: 100, name: 'discount_rate' })
  discountRate: number; // 0-100: 78表示78折

  @Column({ type: 'char', length: 3, default: 'CNY', name: 'currency' })
  currency: string; // 货币代码
}
```

#### 创建/更新 DTO:
**文件**: `/Users/peakom/work/ruizhu_project/nestapi/src/modules/products/dto/create-product.dto.ts`

```typescript
export class CreateProductDto {
  @IsIn(['standard', 'custom', 'vip_recharge'])
  productType?: 'standard' | 'custom' | 'vip_recharge';
  
  @IsNumber()
  @Min(0.01)
  @Max(1.0)
  discount?: number = 1.0; // VIP折扣倍数
}
```

### 1.2 会员信息 - Membership 实体
**文件**: `/Users/peakom/work/ruizhu_project/nestapi/src/modules/memberships/entities/membership.entity.ts`

```typescript
@Entity('memberships')
export class Membership {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'user_id', unique: true })
  userId: number;

  // 个人信息
  @Column('varchar', { length: 10, name: 'salutation' })
  salutation: string; // 先生 / 女士

  @Column('varchar', { length: 50, name: 'last_name' })
  lastName: string;

  @Column('varchar', { length: 50, name: 'first_name' })
  firstName: string;

  @Column('varchar', { length: 20, name: 'mobile' })
  mobile: string;

  @Column('date', { name: 'birth_date', nullable: true })
  birthDate: Date;

  @Column('varchar', { length: 50, name: 'province', nullable: true })
  province: string;

  @Column('varchar', { length: 50, name: 'city', nullable: true })
  city: string;

  @Column('varchar', { length: 50, name: 'district', nullable: true })
  district: string;

  // 授权同意
  @Column('tinyint', { default: 1, name: 'required_consent' })
  requiredConsent: number; // 必要同意

  @Column('tinyint', { default: 0, name: 'marketing_consent' })
  marketingConsent: number; // 加入顾客数据库

  @Column('tinyint', { default: 0, name: 'analysis_consent' })
  analysisConsent: number; // 数据分析

  @Column('tinyint', { default: 0, name: 'marketing_optional_consent' })
  marketingOptionalConsent: number; // 营销可选授权
}
```

### 1.3 会员权益 - MemberBenefit 实体
**文件**: `/Users/peakom/work/ruizhu_project/nestapi/src/entities/member-benefit.entity.ts`

```typescript
@Entity('member_benefits')
export class MemberBenefit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, comment: '礼遇标题' })
  title: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '礼遇副标题/描述' })
  subtitle: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'image_url', comment: '图片URL' })
  imageUrl: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'image_key', comment: '图片文件Key' })
  imageKey: string | null;

  @Column({ type: 'boolean', default: true, name: 'is_active', comment: '是否启用' })
  isActive: boolean;

  @Column({ type: 'int', default: 0, name: 'sort_order', comment: '排序顺序' })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 1.4 支付记录 - Payment 实体
**文件**: `/Users/peakom/work/ruizhu_project/nestapi/src/payments/entities/payment.entity.ts`

```typescript
export enum PaymentStatus {
  PENDING = 'pending',        // 待支付
  PROCESSING = 'processing',  // 处理中
  SUCCESS = 'success',        // 支付成功
  FAILED = 'failed',          // 支付失败
  CANCELLED = 'cancelled',    // 已取消
  REFUNDED = 'refunded',      // 已退款
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64, unique: true })
  transactionNo: string; // 商户交易流水号

  @Column({ type: 'varchar', length: 64, nullable: true })
  wechatTransactionId: string; // 微信支付交易号

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'int' })
  orderId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number; // 支付金额（分）

  @Column({ type: 'varchar', length: 20, default: PaymentMethod.WECHAT })
  paymentMethod: PaymentMethod; // 微信支付

  @Column({ type: 'varchar', length: 20, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  prepayId: string; // 微信预支付ID

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date; // 支付完成时间

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## 2. 充值流程和支付逻辑

### 2.1 微信支付服务 - WechatPaymentService
**文件**: `/Users/peakom/work/ruizhu_project/nestapi/src/modules/wechat/services/wechat-payment.service.ts`

#### 流程步骤:

**Step 1: 创建统一下单**
```typescript
async createUnifiedOrder(dto: CreateUnifiedOrderDto): Promise<CreatePaymentResponseDto>
```
- 将金额转换为分（如果输入是元）
- 生成随机字符串和时间戳
- 构建微信支付请求参数
- 计算MD5签名
- 调用微信统一下单API
- 返回预支付ID和客户端支付签名

**Step 2: 微信支付回调处理**
```typescript
async handlePaymentCallback(callbackData: WechatPaymentCallbackDto): Promise<void>
```
- 验证回调签名
- 查找对应的支付记录
- 更新支付状态为success
- **关键: 调用 markOrderAsPaid 更新订单状态**
- **关键: 调用 applyVipDiscountIfApplicable 处理VIP权益**

**Step 3: VIP权益处理**
```typescript
private async applyVipDiscountIfApplicable(orderId: string, userId: string): Promise<void>
```
- 查询订单及所有订单项
- 遍历订单项，查询产品信息
- 检查是否存在 `productType === 'vip_recharge'` 的产品
- 如果存在，获取该产品的 discount 值
- 更新用户的 discount 字段为该值

```typescript
// 注意：用户实体需要添加 discount 字段（当前代码中可能还未添加）
user.discount = vipProductDiscount; // 例如: 0.8 表示8折
await this.userRepository.save(user);
```

**Step 4: 查询订单状态**
```typescript
async queryOrderStatus(dto: QueryOrderStatusDto): Promise<OrderStatusResponseDto>
```
- 从数据库查询支付记录
- 如果本地状态为pending，主动向微信查询最新状态
- 更新本地状态

---

## 3. 前端小程序实现

### 3.1 会员信息页面
**文件**: `/Users/peakom/work/ruizhu_project/miniprogram/src/pages/membership/join.vue`

#### 功能:
- 加载并编辑会员个人信息
- 称谓、姓名、手机号、出生日期、省市区
- 隐私政策同意、营销同意、数据分析同意

#### 关键方法:
```typescript
async loadMembershipProfile() // 加载现有会员信息
async onSave() // 保存会员信息
async onSalutationChange(e) // 改变称谓
async onRegionChange(e) // 改变省市区
```

### 3.2 支付页面
**文件**: `/Users/peakom/work/ruizhu_project/miniprogram/src/pages/payment/payment.vue`

#### 流程:
1. **加载订单信息**: 从本地缓存获取 currentOrder
2. **发起支付**:
   - 调用 wechatPaymentService.createPaymentOrder()
   - 获取用户openid
   - 生成支付订单

3. **调起微信支付**:
   ```typescript
   wx.requestPayment({
     timeStamp: paymentData.timeStamp,
     nonceStr: paymentData.nonceStr,
     package: `prepay_id=${paymentData.prepayId}`,
     signType: paymentData.signType,
     paySign: paymentData.paySign,
     success: confirmPaymentSuccess(),
     fail: handlePaymentFail()
   })
   ```

4. **确认支付成功**:
   ```typescript
   async confirmPaymentSuccess(outTradeNo) {
     // 查询支付状态
     const status = await wechatPaymentService.queryPaymentStatus(outTradeNo, openid)
     
     if (status === 'success') {
       // 刷新订单信息
       const freshOrder = await ordersService.getOrderDetail(this.order.id)
       
       // 如果订单包含vip_recharge产品，刷新用户信息获取discount
       if (hasVipProduct) {
         const freshUserInfo = await usersService.getUserInfo()
         uni.setStorageSync('userInfo', freshUserInfo)
       }
       
       // 清除临时缓存
       uni.removeStorageSync('currentOrder')
       uni.removeStorageSync('buyNowOrder')
       uni.removeStorageSync('checkoutItems')
       
       // 跳转到首页
       uni.switchTab({ url: '/pages/index/index' })
     }
   }
   ```

### 3.3 会员权益服务
**文件**: `/Users/peakom/work/ruizhu_project/miniprogram/src/services/member-benefits.ts`

```typescript
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

export const memberBenefitsService = {
  async getActiveMemberBenefits(): Promise<MemberBenefit[]>
  async getMemberBenefitById(id: number): Promise<MemberBenefit | null>
}
```

---

## 4. 充值产品数据结构

### 4.1 VIP充值产品完整数据结构
```typescript
{
  id: number,                          // 产品ID
  name: string,                        // 产品名称（例: "VIP会员年卡"）
  subtitle?: string,                   // 产品副标题
  sku?: string,                        // 商品编号
  description?: string,                // 产品描述
  productType: 'vip_recharge',        // 产品类型标识
  categoryId: number,                  // 分类ID
  
  // 库存信息
  isNew: boolean,                      // 是否新品
  isSaleOn: boolean,                   // 是否上架
  isOutOfStock: boolean,               // 是否缺货
  isSoldOut: boolean,                  // 是否售完
  stockStatus: 'normal' | 'outOfStock' | 'soldOut',
  isVipOnly: boolean,                  // 是否仅限VIP购买
  stockQuantity: number,               // 库存数量
  lowStockThreshold: number,           // 库存预警阈值
  
  // 价格信息
  originalPrice: number,               // 原价（分为单位）
  currentPrice: number,                // 现价（分为单位）
  discountRate: number,                // 折扣率（0-100）
  currency: string,                    // 货币代码（默认CNY）
  vipDiscountRate?: number,            // VIP折扣率
  discount: number,                    // VIP折扣倍数（0.01-1.00），关键字段
  
  // 运费信息
  weight?: number,                     // 重量（克）
  shippingTemplateId?: number,         // 运费模板ID
  freeShippingThreshold?: number,      // 免运费阈值（元）
  
  // 图片信息
  coverImageUrl?: string,              // 封面图片URL
  coverImageId?: number,               // 封面图片ID
  images?: ProductImage[],             // 产品图片数组
  
  // 统计信息
  salesCount: number,                  // 销售数
  viewsCount: number,                  // 浏览数
  averageRating: number,               // 平均评分
  reviewsCount: number,                // 评论数
  favoritesCount: number,              // 收藏数
  conversionRate?: number,             // 转化率
  lastSoldAt?: Date,                   // 最后销售时间
  
  createdAt: Date,
  updatedAt: Date
}
```

### 4.2 会员权益数据结构
```typescript
{
  id: number,
  title: string,                       // 权益标题（例: "享受专享折扣"）
  subtitle?: string | null,            // 权益描述
  imageUrl?: string | null,            // 权益图片URL
  imageKey?: string | null,            // 权益图片Key
  isActive: boolean,                   // 是否启用
  sortOrder: number,                   // 排序顺序
  createdAt: Date,
  updatedAt: Date
}
```

---

## 5. 充值后的权益和处理逻辑

### 5.1 权益应用流程

```
用户购买VIP充值产品
       ↓
提交订单
       ↓
前端发起微信支付
       ↓
微信回调通知后端
       ↓
后端验证签名 ✓
       ↓
更新Payment状态为success
       ↓
调用 markOrderAsPaid() 更新Order状态为paid
       ↓
调用 applyVipDiscountIfApplicable()
       ├─ 查询订单项中是否有vip_recharge产品
       ├─ 获取该产品的discount值
       └─ 更新用户discount字段
       ↓
返回成功响应
       ↓
前端查询支付状态
       ↓
支付成功 ✓
       ├─ 刷新订单信息
       ├─ 如包含VIP产品，刷新用户信息（获取新的discount）
       ├─ 清除临时缓存
       └─ 跳转到首页
```

### 5.2 权益存储和使用

**权益存储位置**: `users` 表的 `discount` 字段（需确认已添加）

**权益值范围**: 0.01 - 1.00
- 1.00 = 无折扣（原价购买）
- 0.90 = 9折优惠
- 0.80 = 8折优惠
- 0.50 = 5折优惠

**权益使用场景**:
1. **下单时应用**: 计算订单商品总额时，将每件商品价格乘以user.discount
2. **订单显示**: 展示有效的VIP折扣信息
3. **统计分析**: 追踪用户的VIP权益价值

### 5.3 关键代码逻辑

```typescript
// 后端：支付成功后应用VIP权益
private async applyVipDiscountIfApplicable(
  orderId: string,
  userId: string,
): Promise<void> {
  try {
    // 1. 查询订单及订单项
    const order = await this.orderRepository.findOne({
      where: { id: parseInt(orderId, 10) },
      relations: ['items'],
    });

    if (!order || !order.items || order.items.length === 0) {
      return;
    }

    // 2. 检查是否有vip_recharge产品
    let vipProductDiscount: number | null = null;

    for (const item of order.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (
        product &&
        product.productType === 'vip_recharge' &&
        product.discount
      ) {
        vipProductDiscount = product.discount;
        this.logger.log(
          `找到VIP充值产品: productId=${item.productId}, discount=${vipProductDiscount}`,
        );
        break;
      }
    }

    // 3. 更新用户discount
    if (vipProductDiscount !== null) {
      const user = await this.userRepository.findOne({
        where: { id: parseInt(userId, 10) },
      });

      if (!user) {
        this.logger.warn(`用户未找到: userId=${userId}`);
        return;
      }

      const oldDiscount = user.discount;
      user.discount = vipProductDiscount;
      await this.userRepository.save(user);

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

// 前端：支付成功后刷新用户信息
if (this.order && this.order.items && this.order.items.length > 0) {
  const hasVipProduct = this.order.items.some(
    item => item.productType === 'vip_recharge' || item.type === 'vip_recharge'
  );
  
  if (hasVipProduct) {
    console.log('📡 [Payment] 订单包含VIP产品，刷新用户信息...');
    const usersService = require('../../services/users').default;
    const freshUserInfo = await usersService.getUserInfo();
    if (freshUserInfo) {
      uni.setStorageSync('userInfo', freshUserInfo);
      console.log('✅ [Payment] 用户信息已刷新，discount:', freshUserInfo.discount);
    }
  }
}
```

---

## 6. API 接口汇总

### 6.1 会员权益 API
- **GET** `/api/v1/member-benefits` - 获取启用的会员权益列表（前端展示）
- **GET** `/api/v1/member-benefits/:id` - 获取单个会员权益详情

### 6.2 会员信息 API
- **GET** `/api/v1/memberships` - 获取会员个人信息
- **POST** `/api/v1/memberships` - 创建会员信息
- **PUT** `/api/v1/memberships` - 更新会员信息

### 6.3 支付 API
- **POST** `/api/v1/wechat/pay/unifiedorder` - 创建微信支付订单
- **POST** `/api/v1/wechat/pay/callback` - 微信支付回调（异步）
- **POST** `/api/v1/wechat/pay/query-order` - 查询订单支付状态
- **POST** `/api/v1/wechat/pay/refund` - 发起退款

### 6.4 订单 API
- **POST** `/api/v1/orders` - 创建订单
- **GET** `/api/v1/orders` - 获取用户订单列表
- **GET** `/api/v1/orders/:id` - 获取订单详情
- **PUT** `/api/v1/orders/:id` - 更新订单
- **DELETE** `/api/v1/orders/:id` - 取消订单

---

## 7. 数据库表关系

```
users (用户表)
├── id (PK)
├── email
├── username
├── discount (VIP折扣倍数) ← 关键字段
└── createdAt

products (商品表)
├── id (PK)
├── name
├── productType (standard | custom | vip_recharge)
├── discount (VIP折扣倍数，仅vip_recharge使用)
├── currentPrice (现价，分)
├── stockStatus
└── createdAt

orders (订单表)
├── id (PK)
├── userId (FK → users)
├── orderNumber
├── items (JSON，包含productId、quantity等)
├── totalAmount (总金额，分)
├── finalAmount (最终金额，分)
├── status (pending → paid → shipped → delivered)
├── paidAt
└── createdAt

payments (支付表)
├── id (PK)
├── userId (FK → users)
├── orderId (FK → orders)
├── transactionNo
├── amount (支付金额，分)
├── status (pending → success → refunded)
├── prepayId (微信预支付ID)
└── createdAt

memberships (会员信息表)
├── id (PK)
├── userId (FK → users)
├── lastName
├── firstName
├── mobile
├── birthDate
├── province, city, district
├── requiredConsent
├── marketingConsent
└── createdAt

member_benefits (会员权益表)
├── id (PK)
├── title
├── subtitle
├── imageUrl
├── isActive
├── sortOrder
└── createdAt
```

