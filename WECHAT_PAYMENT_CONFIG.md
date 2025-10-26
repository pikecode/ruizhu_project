# 微信小程序支付配置

微信小程序支付只需要配置 3 个参数。

## 1. 获取小程序 AppID

1. 登录微信小程序后台: https://mp.weixin.qq.com
2. 进入 "设置" → "开发设置"
3. 复制 **AppID** (以 `wx` 开头的32位字符)

## 2. 获取商户号和API密钥

1. 已有微信商户账号?
   - 否: 先在 https://pay.weixin.qq.com 注册商户账号
   - 是: 进入下一步

2. 登录微信商户平台: https://pay.weixin.qq.com

3. 获取商户号:
   - "账户设置" → "商户信息"
   - 复制 **商户号** (10位数字)

4. 获取API密钥:
   - "账户设置" → "API安全"
   - 点击 "设置API密钥"
   - 输入自己定义的32位密钥 (或系统生成)
   - 复制 **API密钥**

## 3. 关联小程序到商户

1. 在商户平台:
   - "产品中心" → "我的产品"
   - 点击 "申请"关联小程序

2. 在小程序后台:
   - "设置" → "开发设置"
   - 绑定商户号

## 4. 在项目中配置

编辑 `nestapi/.env`:

```env
# WeChat Mini Program Payment
WECHAT_APP_ID=wxxxxxxxxxxxxxxxx      # 小程序AppID
WECHAT_MCH_ID=1234567890             # 商户号
WECHAT_API_KEY=xxxxxxxxxxxxxxxx      # API密钥
```

## 5. 支付流程

```
用户点击支付
    ↓
创建订单 (order)
    ↓
创建支付记录 (payment)
    ↓
后端生成微信签名 (appId, mchId, apiKey)
    ↓
前端调用 uni.requestPayment(签名)
    ↓
微信支付页面弹出
    ↓
用户完成支付 / 取消支付
    ↓
微信发送支付结果回调
    ↓
后端处理回调，更新payment和order状态
    ↓
前端显示成功/失败页面
```

## 6. 代码位置

- **后端支付创建**: `nestapi/src/payments/payments.service.ts:createPayment()`
- **后端签名生成**: `nestapi/src/payments/payments.service.ts:generateWechatSignature()`
- **后端回调处理**: `nestapi/src/payments/payments.controller.ts:handleWechatCallback()`
- **前端支付页面**: `miniprogram/src/pages/payment/pay.vue`
- **前端成功页面**: `miniprogram/src/pages/order/success.vue`

## 7. 测试

### 开发环境测试

1. 在微信小程序开发者工具中运行项目
2. 点击 "立即购买" → 确认订单 → "立即支付"
3. 小程序开发者工具会打开支付调试窗口
4. 选择测试商户并完成支付

### 生产环境

1. 替换 `.env` 中的真实 AppID、商户号、API密钥
2. 构建小程序生产包
3. 上传到微信小程序平台审核

## 8. 常见问题

**Q: 报错 "商户号不存在"**
- A: 检查商户号是否正确填写

**Q: 报错 "签名失败"**
- A: 检查 API密钥是否正确，签名参数顺序是否正确

**Q: 支付页面不弹出**
- A: 确保小程序和商户号已关联

**Q: 回调未收到**
- A: 在商户平台确认回调地址是否已配置

---

就这样，配置好这3个参数就能使用微信小程序支付了！
