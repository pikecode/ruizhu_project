# RUIZHU 小程序 API 接口设计文档

## 1. API 设计规范

### 1.1 基础配置

```
API基础URL: https://api.ruizhu.com/v1
协议: HTTPS/TLS 1.3
认证方式: JWT Bearer Token
响应格式: JSON
字符编码: UTF-8
时间格式: ISO 8601 (2024-10-25T12:00:00Z)
```

### 1.2 请求/响应格式

```json
// 成功响应 (200)
{
  "code": 0,
  "message": "success",
  "data": {
    // 具体数据
  },
  "timestamp": "2024-10-25T12:00:00Z"
}

// 失败响应 (4xx/5xx)
{
  "code": 4001,
  "message": "用户未认证",
  "error": {
    "type": "unauthorized",
    "detail": "Token已过期"
  },
  "timestamp": "2024-10-25T12:00:00Z"
}
```

### 1.3 错误代码定义

```
0    - 成功
4001 - 未认证 (Unauthorized)
4002 - 无权限 (Forbidden)
4003 - 资源不存在 (Not Found)
4004 - 请求参数错误 (Bad Request)
4005 - 业务逻辑错误 (Conflict)
5001 - 服务器内部错误
5002 - 服务暂时不可用
```

---

## 2. 认证相关 API

### 2.1 微信登录

```http
POST /auth/wechat/login
Content-Type: application/json

Request:
{
  "code": "021wechatcode123",
  "iv": "aabbcc...",
  "encryptedData": "xyz..."
}

Response (200):
{
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "eyJhbGc...",
    "token_type": "Bearer",
    "expires_in": 604800,
    "refresh_token": "refresh_token_xxx",
    "user": {
      "id": 123,
      "openid": "oXXX",
      "nickname": "用户昵称",
      "avatar_url": "https://...",
      "user_type": 0,
      "vip_level": 0
    }
  }
}
```

### 2.2 刷新 Token

```http
POST /auth/refresh
Content-Type: application/json
Authorization: Bearer {refresh_token}

Response (200):
{
  "code": 0,
  "data": {
    "access_token": "new_token",
    "expires_in": 604800
  }
}
```

### 2.3 登出

```http
POST /auth/logout
Authorization: Bearer {token}

Response (200):
{
  "code": 0,
  "message": "登出成功"
}
```

---

## 3. 用户相关 API

### 3.1 获取用户信息

```http
GET /users/me
Authorization: Bearer {token}

Response (200):
{
  "code": 0,
  "data": {
    "id": 123,
    "openid": "oXXX",
    "nickname": "张三",
    "avatar_url": "https://...",
    "phone": "13800138000",
    "email": "user@example.com",
    "gender": 1,
    "city": "深圳市",
    "province": "广东省",
    "user_type": 0,
    "vip_level": 0,
    "vip_expire_date": null,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 3.2 更新用户信息

```http
PUT /users/me
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "nickname": "新昵称",
  "phone": "13900139000",
  "avatar_url": "https://..."
}

Response (200):
{
  "code": 0,
  "data": { /* 更新后的用户对象 */ }
}
```

### 3.3 获取 VIP 信息

```http
GET /users/me/vip
Authorization: Bearer {token}

Response (200):
{
  "code": 0,
  "data": {
    "vip_level": 1,
    "vip_name": "金卡会员",
    "expire_date": "2025-01-01T00:00:00Z",
    "benefits": [
      {
        "name": "12期分期免息",
        "description": "单笔订单≥15000元可享"
      }
    ]
  }
}
```

---

## 4. 商品相关 API

### 4.1 获取商品列表

```http
GET /products?category=all&page=1&per_page=10&sort=newest&price_min=0&price_max=100000
Authorization: Bearer {token}

Query Parameters:
- category: 分类ID或all
- page: 页码 (默认1)
- per_page: 每页数量 (默认10)
- sort: 排序方式 (newest/price_asc/price_desc/hot)
- price_min: 最低价格
- price_max: 最高价格
- search: 搜索关键词

Response (200):
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "sku": "PRD001",
        "name": "Prada手袋",
        "price": 17900,
        "original_price": 20000,
        "main_image": "https://...",
        "category_id": 1,
        "is_new": true,
        "is_hot": false,
        "sold_count": 100,
        "stock": 50
      }
    ],
    "total": 100,
    "page": 1,
    "per_page": 10,
    "has_more": true
  }
}
```

### 4.2 获取商品详情

```http
GET /products/{id}
Authorization: Bearer {token}

Response (200):
{
  "code": 0,
  "data": {
    "id": 1,
    "sku": "PRD001",
    "name": "Prada Explore中号Re-Nylon单肩包",
    "description": "详细描述...",
    "price": 17900,
    "original_price": 20000,
    "stock": 50,
    "sold_count": 100,
    "main_image": "https://...",
    "images": ["https://...", "https://..."],
    "colors": ["黑色", "棕色", "白色"],
    "sizes": ["均码"],
    "materials": "Re-Nylon与牛皮革混合",
    "brand": "RUIZHU",
    "category": {
      "id": 1,
      "name": "手袋"
    },
    "is_new": true,
    "is_hot": false,
    "is_favorite": false
  }
}
```

### 4.3 搜索商品

```http
GET /products/search?q=背包&category=all
Authorization: Bearer {token}

Query Parameters:
- q: 搜索关键词
- category: 分类 (可选)

Response (200):
{
  "code": 0,
  "data": {
    "items": [ /* 搜索结果 */ ],
    "total": 10,
    "search_keyword": "背包"
  }
}
```

### 4.4 获取分类列表

```http
GET /categories
Authorization: Bearer {token}

Response (200):
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "手袋",
        "icon_url": "https://...",
        "product_count": 50
      },
      {
        "id": 2,
        "name": "服装",
        "icon_url": "https://...",
        "product_count": 80
      }
    ]
  }
}
```

### 4.5 获取推荐商品

```http
GET /recommendations?position=home_recommend&limit=10
Authorization: Bearer {token}

Response (200):
{
  "code": 0,
  "data": {
    "items": [ /* 推荐的商品列表 */ ],
    "position": "home_recommend"
  }
}
```

---

## 5. 购物车 API

### 5.1 获取购物车

```http
GET /cart
Authorization: Bearer {token}

Response (200):
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "product_name": "Prada手袋",
        "product_image": "https://...",
        "price": 17900,
        "color": "黑色",
        "size": "均码",
        "quantity": 2,
        "subtotal": 35800
      }
    ],
    "subtotal": 35800,
    "count": 1
  }
}
```

### 5.2 添加到购物车

```http
POST /cart/items
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "product_id": 1,
  "color": "黑色",
  "size": "均码",
  "quantity": 1
}

Response (200):
{
  "code": 0,
  "data": { /* 购物车项 */ }
}
```

### 5.3 更新购物车项

```http
PUT /cart/items/{id}
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "quantity": 5
}

Response (200):
{
  "code": 0,
  "data": { /* 更新后的购物车项 */ }
}
```

### 5.4 删除购物车项

```http
DELETE /cart/items/{id}
Authorization: Bearer {token}

Response (200):
{
  "code": 0,
  "message": "删除成功"
}
```

---

## 6. 订单相关 API

### 6.1 获取订单列表

```http
GET /orders?status=all&page=1&per_page=10
Authorization: Bearer {token}

Query Parameters:
- status: 订单状态 (all/pending/paid/shipped/completed/cancelled)
- page: 页码
- per_page: 每页数量

Response (200):
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "order_no": "ORD2024102500001",
        "status": 0,
        "status_text": "待支付",
        "total_price": 35800,
        "item_count": 1,
        "created_at": "2024-10-25T12:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "per_page": 10
  }
}
```

### 6.2 创建订单

```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "items": [
    {
      "product_id": 1,
      "color": "黑色",
      "size": "均码",
      "quantity": 2
    }
  ],
  "address_id": 10,
  "coupon_code": "COUPON2024",
  "remark": "备注信息"
}

Response (200):
{
  "code": 0,
  "data": {
    "order_no": "ORD2024102500001",
    "order_id": 1,
    "total_price": 35800,
    "prepay_data": {
      "prepay_id": "wx...",
      "noncestr": "abc123",
      "timestamp": "1698124800",
      "sign": "...",
      "package": "prepay_id=wx..."
    }
  }
}
```

### 6.3 获取订单详情

```http
GET /orders/{id}
Authorization: Bearer {token}

Response (200):
{
  "code": 0,
  "data": {
    "id": 1,
    "order_no": "ORD2024102500001",
    "status": 1,
    "status_text": "已支付",
    "subtotal": 35800,
    "express_price": 10,
    "discount_price": 0,
    "total_price": 35810,
    "payment_method": "wechat",
    "payment_time": "2024-10-25T13:00:00Z",
    "items": [
      {
        "product_id": 1,
        "product_name": "Prada手袋",
        "color": "黑色",
        "quantity": 2,
        "price": 17900,
        "subtotal": 35800
      }
    ],
    "address": {
      "receiver_name": "张三",
      "receiver_phone": "13800138000",
      "receiver_province": "广东省",
      "receiver_city": "深圳市",
      "receiver_district": "福田区",
      "receiver_detail": "中心广场A座2501室"
    },
    "express": {
      "code": "SF",
      "name": "顺丰快递",
      "no": "SF123456789",
      "time": "2024-10-25T15:00:00Z"
    },
    "created_at": "2024-10-25T12:00:00Z"
  }
}
```

### 6.4 取消订单

```http
POST /orders/{id}/cancel
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "reason": "不想要了"
}

Response (200):
{
  "code": 0,
  "data": { /* 更新后的订单 */ }
}
```

---

## 7. 地址 API

### 7.1 获取地址列表

```http
GET /addresses
Authorization: Bearer {token}

Response (200):
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "张三",
        "phone": "13800138000",
        "province": "广东省",
        "city": "深圳市",
        "district": "福田区",
        "detail": "中心广场A座2501室",
        "is_default": true
      }
    ]
  }
}
```

### 7.2 创建地址

```http
POST /addresses
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "name": "李四",
  "phone": "13900139000",
  "province": "上海市",
  "city": "浦东新区",
  "district": "陆家嘴",
  "detail": "世纪大道1号",
  "is_default": false
}

Response (200):
{
  "code": 0,
  "data": { /* 创建的地址对象 */ }
}
```

### 7.3 更新地址

```http
PUT /addresses/{id}
Authorization: Bearer {token}
Content-Type: application/json

Request: { /* 同创建请求 */ }

Response (200):
{
  "code": 0,
  "data": { /* 更新后的地址对象 */ }
}
```

### 7.4 删除地址

```http
DELETE /addresses/{id}
Authorization: Bearer {token}

Response (200):
{
  "code": 0,
  "message": "删除成功"
}
```

---

## 8. 支付相关 API

### 8.1 获取微信支付签名

```http
POST /payments/wechat/prepare
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "order_id": 1
}

Response (200):
{
  "code": 0,
  "data": {
    "appid": "wx...",
    "partnerid": "1234567890",
    "prepayid": "wx...",
    "noncestr": "abc123",
    "timestamp": "1698124800",
    "sign": "...",
    "signtype": "MD5"
  }
}
```

### 8.2 查询支付状态

```http
GET /payments/{id}/status
Authorization: Bearer {token}

Response (200):
{
  "code": 0,
  "data": {
    "status": 1,
    "status_text": "已支付",
    "payment_time": "2024-10-25T13:00:00Z",
    "transaction_id": "wx..."
  }
}
```

---

## 9. 收藏 API

### 9.1 获取收藏列表

```http
GET /favorites?page=1&per_page=20
Authorization: Bearer {token}

Response (200):
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "product": { /* 商品对象 */ }
      }
    ],
    "total": 10
  }
}
```

### 9.2 添加收藏

```http
POST /favorites
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "product_id": 1
}

Response (200):
{
  "code": 0,
  "message": "收藏成功"
}
```

### 9.3 取消收藏

```http
DELETE /favorites/{product_id}
Authorization: Bearer {token}

Response (200):
{
  "code": 0,
  "message": "取消收藏成功"
}
```

---

## 10. 优惠券 API

### 10.1 验证优惠券

```http
POST /coupons/validate
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "code": "COUPON2024",
  "order_amount": 35800
}

Response (200):
{
  "code": 0,
  "data": {
    "id": 1,
    "code": "COUPON2024",
    "discount_type": 1,
    "discount_value": 100,
    "discount_amount": 100,
    "final_amount": 35700
  }
}

Response (4005):
{
  "code": 4005,
  "message": "优惠券不可用",
  "error": {
    "type": "coupon_invalid",
    "detail": "优惠券已过期"
  }
}
```

---

**文档版本**: v1.0
**最后更新**: 2024-10-25
