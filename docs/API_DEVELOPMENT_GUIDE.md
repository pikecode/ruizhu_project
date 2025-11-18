# Ruizhu 平台 - API 接口开发指南

## 基础设置

### 基础URL
- 开发：http://localhost:8888/api/v1
- 生产：https://api.ruizhu.com/api/v1

### 认证
- 小程序：使用 WeChat openid + JWT token
- 管理后台：使用用户名密码 + JWT token

---

## API 规范

### 响应格式
```json
{
  "code": 200,              // HTTP状态码
  "message": "Success",     // 消息
  "data": { ... },          // 数据
  "timestamp": 1234567890
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "Invalid product ID",
  "error": "BAD_REQUEST",
  "timestamp": 1234567890
}
```

---

## 核心 API 端点

### 1. 产品管理 API

#### 1.1 获取所有分类
```
GET /categories
响应: Category[]
```

#### 1.2 获取分类下的产品
```
GET /products?categoryId=1&page=1&limit=20&sort=price&order=asc
查询参数:
  - categoryId: 分类ID (可选)
  - page: 页码 (默认1)
  - limit: 每页条数 (默认20)
  - sort: 排序字段 (price, sales, rating) (可选)
  - order: asc/desc (默认asc)

响应: {
  data: Product[],
  total: 100,
  page: 1,
  limit: 20
}
```

#### 1.3 获取产品详情
```
GET /products/:id
响应: {
  id: 1,
  name: "黑色连衣裙",
  sku: "DRESS-001",
  description: "...",
  price: 299.99,
  originalPrice: 399.99,
  stock: 50,
  images: [...],
  variants: [
    { id: 1, color: "黑色", size: "S", stock: 10, priceAdjustment: 0 },
    { id: 2, color: "黑色", size: "M", stock: 15, priceAdjustment: 0 }
  ]
}
```

#### 1.4 搜索产品
```
GET /products/search?q=连衣裙&limit=20
响应: Product[]
```

#### 1.5 获取精选产品
```
GET /products/featured?limit=10
响应: Product[]
```

---

### 2. 购物车 API

#### 2.1 获取购物车
```
GET /cart
认证: 需要JWT token
响应: {
  id: 1,
  userId: 1,
  totalItems: 3,
  totalPrice: 899.97,
  items: [
    {
      id: 1,
      productId: 1,
      productName: "黑色连衣裙",
      quantity: 1,
      selectedColor: "黑色",
      selectedSize: "M",
      price: 299.99,
      isSelected: true
    }
  ]
}
```

#### 2.2 添加到购物车
```
POST /cart/add
认证: 需要JWT token
请求体: {
  productId: 1,
  quantity: 1,
  selectedColor: "黑色",
  selectedSize: "M"
}
响应: CartItem
```

#### 2.3 更新购物车项
```
PATCH /cart/items/:id
认证: 需要JWT token
请求体: {
  quantity: 2,
  isSelected: true
}
响应: CartItem
```

#### 2.4 删除购物车项
```
DELETE /cart/items/:id
认证: 需要JWT token
响应: { message: "Item removed" }
```

#### 2.5 清空购物车
```
DELETE /cart
认证: 需要JWT token
响应: { message: "Cart cleared" }
```

---

### 3. 订单 API

#### 3.1 创建订单
```
POST /orders
认证: 需要JWT token
请求体: {
  addressId: 1,
  couponCode: "SAVE10" (可选),
  phone: "13800138000"
}
响应: {
  id: 101,
  userId: 1,
  addressId: 1,
  totalPrice: 899.97,
  status: "pending",
  items: [
    {
      id: 1,
      productId: 1,
      productName: "黑色连衣裙",
      quantity: 1,
      unitPrice: 299.99,
      totalPrice: 299.99
    }
  ],
  createdAt: "2024-10-26T12:00:00Z"
}
```

#### 3.2 获取订单列表
```
GET /orders?status=all&page=1&limit=20
认证: 需要JWT token
查询参数:
  - status: all/pending/confirmed/shipped/delivered/cancelled
  - page: 页码
  - limit: 每页条数

响应: {
  data: Order[],
  total: 10,
  page: 1
}
```

#### 3.3 获取订单详情
```
GET /orders/:id
认证: 需要JWT token
响应: Order (含items和address信息)
```

#### 3.4 取消订单
```
POST /orders/:id/cancel
认证: 需要JWT token
响应: { message: "Order cancelled", status: "cancelled" }
```

---

### 4. 愿望清单 API

#### 4.1 获取愿望清单
```
GET /wishlist
认证: 需要JWT token
响应: {
  id: 1,
  userId: 1,
  items: [
    {
      id: 1,
      productId: 1,
      product: { id: 1, name: "...", price: 299.99, image: "..." }
    }
  ]
}
```

#### 4.2 添加到愿望清单
```
POST /wishlist/add
认证: 需要JWT token
请求体: {
  productId: 1
}
响应: WishlistItem
```

#### 4.3 从愿望清单删除
```
DELETE /wishlist/:productId
认证: 需要JWT token
响应: { message: "Item removed from wishlist" }
```

---

### 5. 优惠券 API

#### 5.1 验证优惠券
```
POST /coupons/validate
认证: 需要JWT token
请求体: {
  code: "SAVE10",
  orderAmount: 899.97
}
响应: {
  id: 1,
  code: "SAVE10",
  type: "percentage",
  discount: 10,
  discountAmount: 89.997,
  finalAmount: 809.973
}
```

#### 5.2 获取可用优惠券
```
GET /coupons/available?orderAmount=899.97
认证: 需要JWT token
响应: Coupon[]
```

---

### 6. 合集 API

#### 6.1 获取所有合集
```
GET /collections?page=1&limit=10
响应: {
  data: Collection[],
  total: 5
}
```

#### 6.2 获取合集详情
```
GET /collections/:id
响应: {
  id: 1,
  name: "秋冬新品",
  description: "...",
  coverImage: "...",
  products: Product[]
}
```

---

### 7. 地址 API

#### 7.1 获取用户地址列表
```
GET /addresses
认证: 需要JWT token
响应: Address[]
```

#### 7.2 添加地址
```
POST /addresses
认证: 需要JWT token
请求体: {
  recipientName: "张三",
  phone: "13800138000",
  province: "广东省",
  city: "深圳市",
  district: "南山区",
  detailedAddress: "科技路1号",
  isDefault: false
}
响应: Address
```

#### 7.3 更新地址
```
PATCH /addresses/:id
认证: 需要JWT token
请求体: { ... 同上 ... }
响应: Address
```

#### 7.4 删除地址
```
DELETE /addresses/:id
认证: 需要JWT token
响应: { message: "Address deleted" }
```

---

## 小程序集成指南

### 1. 登录流程
```javascript
// 1. 获取登录code
wx.login({
  success: (res) => {
    const code = res.code
    // 2. 发送code到后端
    POST /auth/wechat/login
    { code: "..." }
    响应: { token: "...", user: { ... } }
  }
})
```

### 2. API 调用示例
```javascript
// 获取产品列表
uni.request({
  url: 'http://localhost:8888/api/v1/products?categoryId=1',
  method: 'GET',
  header: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  success: (res) => {
    console.log(res.data)
  }
})
```

### 3. 错误处理
```javascript
// 统一处理401/403错误
if (res.statusCode === 401) {
  // token过期，重新登录
  redirectToLogin()
}
```

---

## 管理后台 API

### 1. 产品管理

#### 创建产品
```
POST /admin/products
认证: 需要admin权限
请求体: {
  name: "黑色连衣裙",
  sku: "DRESS-001",
  description: "...",
  categoryId: 1,
  price: 299.99,
  originalPrice: 399.99,
  stock: 100,
  status: "active"
}
```

#### 更新产品
```
PATCH /admin/products/:id
认证: 需要admin权限
```

#### 删除产品
```
DELETE /admin/products/:id
认证: 需要admin权限
```

#### 上传产品图片
```
POST /admin/products/:id/images
认证: 需要admin权限
请求: multipart/form-data (image files)
```

### 2. 订单管理

#### 查看所有订单
```
GET /admin/orders?status=pending&page=1&limit=20
认证: 需要admin权限
```

#### 更新订单状态
```
PATCH /admin/orders/:id/status
认证: 需要admin权限
请求体: {
  status: "shipped"
}
```

### 3. 优惠券管理

#### 创建优惠券
```
POST /admin/coupons
认证: 需要admin权限
请求体: {
  code: "SAVE10",
  type: "percentage",
  discount: 10,
  minOrderAmount: 100,
  validFrom: "2024-10-26",
  validUntil: "2024-12-31",
  usageLimit: 1000
}
```

---

## 开发进度

### 第一阶段：核心API
- [ ] 产品管理 API (GET)
- [ ] 购物车 API (CRUD)
- [ ] 订单 API (Create, Read, List)
- [ ] 愿望清单 API (CRUD)

### 第二阶段：高级功能
- [ ] 优惠券验证
- [ ] 支付集成
- [ ] 库存管理

### 第三阶段：管理后台API
- [ ] 产品管理 (Create, Update, Delete)
- [ ] 订单管理 (Update status)
- [ ] 优惠券管理

---

## 代码结构示例

```
nestapi/src/
├── products/
│   ├── entities/
│   │   ├── product.entity.ts
│   │   ├── product-image.entity.ts
│   │   └── product-variant.entity.ts
│   ├── dto/
│   │   ├── create-product.dto.ts
│   │   ├── update-product.dto.ts
│   │   └── product.dto.ts
│   ├── products.service.ts
│   ├── products.controller.ts
│   └── products.module.ts
├── carts/
│   ├── entities/
│   ├── dto/
│   ├── carts.service.ts
│   ├── carts.controller.ts
│   └── carts.module.ts
├── orders/
│   ├── entities/
│   ├── dto/
│   ├── orders.service.ts
│   ├── orders.controller.ts
│   └── orders.module.ts
└── ...
```

---

## 测试示例

### 使用Postman或curl测试

```bash
# 创建category
curl -X POST http://localhost:8888/api/v1/admin/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{"name":"服装","description":"..."}'

# 获取产品列表
curl http://localhost:8888/api/v1/products?categoryId=1

# 添加到购物车
curl -X POST http://localhost:8888/api/v1/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{"productId":1,"quantity":1,"selectedColor":"黑色","selectedSize":"M"}'
```
