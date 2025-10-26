# 微信小程序支付集成指南

**完成日期：** 2025-10-26
**版本：** 1.0

---

## 📋 目录

1. [微信配置信息](#微信配置信息)
2. [后端 API 端点](#后端-api-端点)
3. [小程序支付流程](#小程序支付流程)
4. [前端代码示例](#前端代码示例)
5. [支付回调处理](#支付回调处理)
6. [测试指南](#测试指南)

---

## 微信配置信息

### 商户配置

```
商户ID (mchid): 1730538714
API密钥: RUIZHUYISHUYUNjie202510261214111
AppID: wx0377b6b22ea7e8fc
```

### 小程序配置

```
小程序AppID: wx0377b6b22ea7e8fc
小程序AppSecret: 280b67f53e797ea2fce9de440c1bf506
```

**⚠️ 安全提示：** 这些凭证应该只在服务器端使用，不要暴露给客户端！

---

## 后端 API 端点

### 1. 创建微信支付订单

**端点：** `POST /api/v1/payments/wechat/jsapi`

**请求头：**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**请求体：**
```json
{
  "orderId": 1,
  "description": "订单号：1 的商品"
}
```

**响应示例：**
```json
{
  "statusCode": 201,
  "message": "微信支付订单创建成功",
  "data": {
    "appid": "wx0377b6b22ea7e8fc",
    "timeStamp": "1635000000",
    "nonceStr": "abcdef1234567890",
    "package": "prepay_id=wx2021101600001",
    "signType": "RSA",
    "paySign": "signature_here",
    "prepay_id": "wx2021101600001"
  }
}
```

### 2. 查询支付状态

**端点：** `GET /api/v1/payments/wechat/{outTradeNo}/status`

**请求头：**
```
Authorization: Bearer {JWT_TOKEN}
```

**响应示例：**
```json
{
  "statusCode": 200,
  "message": "查询成功",
  "data": {
    "mchid": "1730538714",
    "appid": "wx0377b6b22ea7e8fc",
    "out_trade_no": "RUIZHU120211635000000",
    "transaction_id": "1234567890",
    "trade_type": "JSAPI",
    "trade_state": "SUCCESS",
    "trade_state_desc": "支付成功",
    "success_time": "2025-10-26T10:00:00+08:00",
    "amount": {
      "total": 100,
      "payer_total": 100,
      "currency": "CNY",
      "payer_currency": "CNY"
    }
  }
}
```

### 3. 申请退款

**端点：** `POST /api/v1/payments/wechat/refund`

**请求头：**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**请求体：**
```json
{
  "outTradeNo": "RUIZHU120211635000000",
  "outRefundNo": "REFUND20251026001",
  "refundAmount": 100,
  "totalAmount": 100
}
```

**响应示例：**
```json
{
  "statusCode": 201,
  "message": "退款申请已提交",
  "data": {
    "refund_id": "50000000382019052709",
    "out_refund_no": "REFUND20251026001",
    "transaction_id": "1234567890",
    "out_trade_no": "RUIZHU120211635000000",
    "refund_status": "SUCCESS",
    "amount": {
      "refund": 100,
      "total": 100,
      "currency": "CNY"
    },
    "create_time": "2025-10-26T10:00:00+08:00"
  }
}
```

### 4. 支付回调（由微信服务器调用）

**端点：** `POST /api/v1/payments/wechat/v3-callback`

**说明：** 此端点由微信服务器调用，无需认证

---

## 小程序支付流程

```
┌─────────────────────────────────────────────────────┐
│                  用户购物流程                        │
└─────────────────────────────────────────────────────┘

1. 用户下单 (生成订单ID)
    ↓
2. 调用后端 API：POST /api/v1/payments/wechat/jsapi
    ↓
3. 后端返回支付参数 (appid, timeStamp, nonceStr, package, paySign)
    ↓
4. 小程序调用 wx.requestPayment()
    ↓
5. 用户完成微信支付
    ↓
6. 微信回调后端
    ↓
7. 后端更新订单状态为 'confirmed'
    ↓
8. 小程序轮询查询支付状态 (可选)
    ↓
9. 支付完成，显示成功页面
```

---

## 前端代码示例

### 1. 下单页面 (checkout.wxml)

```xml
<view class="checkout-container">
  <!-- 订单信息 -->
  <view class="order-info">
    <view class="order-header">订单详情</view>
    <view class="order-item" wx:for="{{cartItems}}" wx:key="id">
      <image src="{{item.product.image}}" />
      <view class="item-info">
        <view class="item-name">{{item.product.name}}</view>
        <view class="item-price">¥{{item.price}}</view>
        <view class="item-quantity">×{{item.quantity}}</view>
      </view>
    </view>
    <view class="order-total">
      <text>合计：</text>
      <text class="price">¥{{totalPrice}}</text>
    </view>
  </view>

  <!-- 支付按钮 -->
  <button
    class="pay-button"
    bindtap="handlePayment"
    loading="{{loading}}"
  >
    立即支付
  </button>
</view>
```

### 2. 下单页面逻辑 (checkout.js)

```javascript
Page({
  data: {
    cartItems: [],
    totalPrice: 0,
    orderId: null,
    loading: false,
  },

  onLoad() {
    this.getCartData();
  },

  /**
   * 获取购物车数据
   */
  async getCartData() {
    try {
      const response = await this.request({
        url: '/api/v1/cart',
        method: 'GET',
      });

      const { items = [], total = 0 } = response.data;
      this.setData({
        cartItems: items,
        totalPrice: total,
      });
    } catch (error) {
      wx.showToast({
        title: '加载购物车失败',
        icon: 'error',
      });
    }
  },

  /**
   * 创建订单
   */
  async createOrder() {
    try {
      const response = await this.request({
        url: '/api/v1/orders',
        method: 'POST',
        data: {
          addressId: 1, // TODO: 从地址列表中选择
          phone: '13800138000', // TODO: 从用户信息中获取
          couponCode: '', // 可选
        },
      });

      return response.data.id;
    } catch (error) {
      wx.showToast({
        title: '创建订单失败',
        icon: 'error',
      });
      throw error;
    }
  },

  /**
   * 处理支付
   */
  async handlePayment() {
    try {
      this.setData({ loading: true });

      // 1. 创建订单
      const orderId = await this.createOrder();

      // 2. 获取支付参数
      const paymentResponse = await this.request({
        url: '/api/v1/payments/wechat/jsapi',
        method: 'POST',
        data: {
          orderId,
          description: `订单号：${orderId} 的商品`,
        },
      });

      const paymentData = paymentResponse.data;

      // 3. 调用微信支付
      await new Promise((resolve, reject) => {
        wx.requestPayment({
          timeStamp: paymentData.timeStamp,
          nonceStr: paymentData.nonceStr,
          package: paymentData.package,
          signType: paymentData.signType,
          paySign: paymentData.paySign,
          success: resolve,
          fail: reject,
        });
      });

      // 4. 支付成功
      wx.showToast({
        title: '支付成功',
        icon: 'success',
        duration: 2000,
      });

      // 5. 跳转到支付成功页面
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/payment-success/index?orderId=' + orderId,
        });
      }, 2000);
    } catch (error) {
      console.error('支付失败:', error);
      wx.showToast({
        title: error.message || '支付失败',
        icon: 'error',
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 网络请求方法
   */
  request({ url, method = 'GET', data = {} }) {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('token'); // 获取 JWT token

      wx.request({
        url: 'https://your-api-domain.com' + url, // 替换为实际的 API 地址
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        success: (res) => {
          if (res.data.statusCode === 200 || res.data.statusCode === 201) {
            resolve(res.data);
          } else {
            reject(new Error(res.data.message || '请求失败'));
          }
        },
        fail: (error) => {
          reject(error);
        },
      });
    });
  },
});
```

### 3. 支付成功页面 (payment-success.wxml)

```xml
<view class="success-container">
  <view class="success-icon">✓</view>
  <view class="success-title">支付成功</view>
  <view class="success-message">
    <view>订单号：{{orderId}}</view>
    <view>支付金额：¥{{amount}}</view>
    <view>支付时间：{{payTime}}</view>
  </view>

  <button class="btn btn-primary" bindtap="goToOrderDetail">
    查看订单详情
  </button>
  <button class="btn btn-secondary" bindtap="goToHome">
    继续购物
  </button>
</view>
```

### 4. 支付成功页面逻辑 (payment-success.js)

```javascript
Page({
  data: {
    orderId: null,
    amount: 0,
    payTime: '',
  },

  onLoad(options) {
    this.setData({
      orderId: options.orderId,
    });
    this.getOrderInfo();
  },

  /**
   * 获取订单信息
   */
  async getOrderInfo() {
    try {
      const response = await this.request({
        url: `/api/v1/orders/${this.data.orderId}`,
        method: 'GET',
      });

      const { totalPrice, updatedAt } = response.data;
      this.setData({
        amount: totalPrice.toFixed(2),
        payTime: new Date(updatedAt).toLocaleString(),
      });
    } catch (error) {
      console.error('获取订单信息失败:', error);
    }
  },

  /**
   * 查看订单详情
   */
  goToOrderDetail() {
    wx.navigateTo({
      url: `/pages/order-detail/index?orderId=${this.data.orderId}`,
    });
  },

  /**
   * 继续购物
   */
  goToHome() {
    wx.switchTab({
      url: '/pages/home/index',
    });
  },

  /**
   * 网络请求方法
   */
  request({ url, method = 'GET', data = {} }) {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('token');

      wx.request({
        url: 'https://your-api-domain.com' + url,
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        success: (res) => {
          if (res.data.statusCode === 200 || res.data.statusCode === 201) {
            resolve(res.data.data);
          } else {
            reject(new Error(res.data.message || '请求失败'));
          }
        },
        fail: reject,
      });
    });
  },
});
```

---

## 支付回调处理

### 后端自动处理

当用户完成支付时，微信服务器会自动调用：

```
POST /api/v1/payments/wechat/v3-callback
```

后端会自动：
1. ✅ 验证回调签名
2. ✅ 更新支付记录状态为 `success`
3. ✅ 更新订单状态为 `confirmed`
4. ✅ 记录交易 ID 和支付时间

**无需前端额外处理回调**

---

## 测试指南

### 1. 开发环境测试

**使用微信官方沙箱环境：**

```
沙箱 AppID: wxd678efh567hg6787
沙箱 Secret: wxd678efh567hg6787
商户号: 1230000109
API 密钥: wxd678efh567hg6787
```

### 2. 测试支付流程

```bash
# 1. 获取 JWT Token（假设已实现登录）
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"password"}'

# 2. 创建订单
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"addressId":1,"phone":"13800138000"}'

# 3. 创建支付订单
curl -X POST http://localhost:3000/api/v1/payments/wechat/jsapi \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"orderId":1,"description":"测试订单"}'

# 4. 查询支付状态
curl -X GET http://localhost:3000/api/v1/payments/wechat/{outTradeNo}/status \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

### 3. 小程序测试

1. **在微信小程序开发者工具中调试：**
   - 启用调试模式
   - 打开网络调试器
   - 观察请求和响应

2. **真机测试：**
   - 使用微信开发者工具预览
   - 使用实际的微信账号
   - 在沙箱环境中完成支付

---

## 常见问题

### Q1: 签名验证失败怎么办？

**A:** 确保：
- API 密钥正确
- 时间戳格式正确（秒而非毫秒）
- 签名算法使用正确的 HMAC-SHA256

### Q2: 支付后订单状态未更新？

**A:** 检查：
- 微信回调是否正确配置
- 服务器是否能接收微信的回调请求
- 查看后端日志了解回调情况

### Q3: 测试环境与生产环境的区别？

**A:**
- **测试：** 使用沙箱环境，不真实扣款
- **生产：** 使用正式商户号，真实扣款

---

## 安全建议

1. ✅ **不要在客户端存储 API 密钥**
2. ✅ **使用 HTTPS 加密所有通信**
3. ✅ **验证所有回调签名**
4. ✅ **实现幂等性处理（防止重复支付）**
5. ✅ **记录所有支付日志用于审计**
6. ✅ **定期更新 API 密钥和证书**

---

## 相关资源

- [微信支付 V3 官方文档](https://pay.weixin.qq.com/docs/merchant/apis/jsapi-payment/direct-jsapi-payment.html)
- [小程序支付开发指南](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信支付回调说明](https://pay.weixin.qq.com/docs/merchant/apis/jsapi-payment/payment-result-notice.html)

---

**最后更新：** 2025-10-26
**维护者：** 技术团队

