# 后端维护系统 - MVP核心模块设计

完全可行！这是一个非常精准的MVP版本，包含最核心的业务功能。

---

## 一、商品管理模块

### 1.1 商品列表
- [x] 商品列表展示（分页）
- [x] 商品搜索（商品名称、SKU、商品编码）
- [x] 商品筛选（分类、品牌、价格范围、库存状态）
- [x] 商品排序（价格、销量、创建时间）
- [x] 批量上架/下架
- [x] 批量删除
- [x] 导出商品列表（Excel）

### 1.2 商品编辑

#### 1.2.1 基本信息编辑
- [x] 商品名称编辑
- [x] 商品描述编辑
- [x] SKU编码编辑
- [x] 商品编码编辑
- [x] 商品副标题编辑

#### 1.2.2 图片管理
- [x] 多图上传（主图、详情图、轮播图）
- [x] 图片排序
- [x] 图片删除
- [x] 图片预览
- [x] 图片CDN地址配置
- [x] 图片压缩处理
- [x] 主图设置

#### 1.2.3 价格库存
- [x] 市场价设置
- [x] 销售价设置
- [x] 成本价设置
- [x] 库存数量设置
- [x] 库存预警值设置
- [x] 库存不足时自动下架

#### 1.2.4 分类标签
- [x] 选择商品分类
- [x] 分类树形选择器
- [x] 商品标签添加（新品、热销、推荐等）
- [x] SEO标题编辑
- [x] SEO描述编辑
- [x] SEO关键词编辑

#### 1.2.5 属性配置
- [x] 品牌选择
- [x] 产地设置
- [x] 材质设置
- [x] 尺码属性编辑
- [x] 颜色属性编辑
- [x] 款式属性编辑
- [x] 自定义属性编辑

### 1.3 商品发布流程
```
创建新商品 → 填写基本信息 → 上传图片 → 设置价格库存
→ 配置分类标签 → 配置属性 → 预览 → 发布 → 上架
```

### 1.4 数据库表设计

**products 表**
```
id                  (主键)
name                (商品名称)
sku                 (商品编码)
product_code        (商品编码)
subtitle            (副标题)
description         (商品描述)
category_id         (分类ID)
brand_id            (品牌ID)
origin              (产地)
material            (材质)
market_price        (市场价)
sale_price          (销售价)
cost_price          (成本价)
stock_quantity      (库存数量)
stock_warning       (库存预警值)
sold_count          (销售数量)
seo_title           (SEO标题)
seo_description     (SEO描述)
seo_keywords        (SEO关键词)
status              (商品状态: 1上架 0下架)
created_at          (创建时间)
updated_at          (更新时间)
```

**product_images 表**
```
id                  (主键)
product_id          (商品ID)
image_url           (图片URL)
image_type          (图片类型: 主图/详情图/轮播图)
sort_order          (排序)
is_main             (是否主图)
created_at          (创建时间)
```

**product_attributes 表**
```
id                  (主键)
product_id          (商品ID)
attribute_name      (属性名)
attribute_value     (属性值)
created_at          (创建时间)
```

**product_tags 表**
```
id                  (主键)
product_id          (商品ID)
tag_id              (标签ID)
created_at          (创建时间)
```

---

## 二、订单管理模块

### 2.1 订单列表
- [x] 订单列表展示（分页）
- [x] 订单搜索（订单号、用户名、手机号）
- [x] 订单多维度筛选
  - [x] 订单状态筛选（待支付、待发货、已发货、已完成）
  - [x] 时间范围筛选
  - [x] 金额范围筛选
  - [x] 支付方式筛选
- [x] 订单排序（创建时间、金额）
- [x] 批量发货
- [x] 批量取消
- [x] 订单导出（Excel）

### 2.2 待支付订单处理
- [x] 支付订单列表
- [x] 发送支付链接给用户
- [x] 手动标记为已支付
- [x] 订单超时自动取消（可配置时间）
- [x] 查看订单详情

### 2.3 待发货订单处理
- [x] 待发货订单列表
- [x] 生成发货单
- [x] 编辑物流信息
  - [x] 选择物流公司
  - [x] 输入物流单号
  - [x] 设置预计送达时间
- [x] 确认发货
- [x] 发送物流信息给用户（短信/邮件）
- [x] 批量发货操作
- [x] 打印发货单

### 2.4 已发货订单
- [x] 已发货订单列表
- [x] 查看物流信息
- [x] 修改物流单号（发货后）
- [x] 标记为已收货
- [x] 订单完成

### 2.5 订单详情页
- [x] 订单基本信息（订单号、下单时间、订单金额）
- [x] 用户信息（昵称、手机、邮箱）
- [x] 收货地址信息
- [x] 订单商品明细
  - [x] 商品图片
  - [x] 商品名称
  - [x] SKU信息
  - [x] 购买数量
  - [x] 商品价格
  - [x] 小计
- [x] 订单流程时间线
  - [x] 下单时间
  - [x] 支付时间
  - [x] 发货时间
  - [x] 物流更新
  - [x] 完成时间
- [x] 物流跟踪信息（实时更新）

### 2.6 数据库表设计

**orders 表**
```
id                  (主键)
order_no            (订单号，唯一)
user_id             (用户ID)
total_amount        (订单总金额)
pay_amount          (已支付金额)
discount_amount     (优惠金额)
shipping_fee        (运费)
status              (订单状态: pending_payment/pending_shipment/shipped/completed)
payment_method      (支付方式)
payment_time        (支付时间)
shipping_time       (发货时间)
completed_time      (完成时间)
logistics_company   (物流公司)
logistics_no        (物流单号)
delivery_address_id (收货地址ID)
remarks             (订单备注)
created_at          (创建时间)
updated_at          (更新时间)
```

**order_items 表**
```
id                  (主键)
order_id            (订单ID)
product_id          (商品ID)
product_name        (商品名称)
product_sku         (商品SKU)
product_price       (商品单价)
quantity            (购买数量)
subtotal            (小计)
created_at          (创建时间)
```

**order_logistics 表**
```
id                  (主键)
order_id            (订单ID)
logistics_company   (物流公司)
logistics_no        (物流单号)
logistics_status    (物流状态: 待揽收/已揽收/运输中/已签收)
updated_at          (更新时间)
created_at          (创建时间)
```

**user_addresses 表**
```
id                  (主键)
user_id             (用户ID)
name                (收货人名字)
phone               (收货人电话)
province            (省份)
city                (城市)
district            (区县)
detail_address      (详细地址)
is_default          (是否默认地址)
created_at          (创建时间)
updated_at          (更新时间)
```

---

## 三、用户管理模块

### 3.1 用户列表
- [x] 用户列表展示（分页）
- [x] 用户搜索（用户名、昵称、手机号、邮箱）
- [x] 用户筛选
  - [x] 按注册时间筛选
  - [x] 按消费金额筛选
  - [x] 按订单数筛选
  - [x] 按用户标签筛选
- [x] 用户排序（注册时间、消费金额、订单数）
- [x] 用户标签分组展示
- [x] 用户分层统计（活跃用户、沉默用户、流失用户）

### 3.2 用户详情
- [x] 基本信息
  - [x] 昵称展示/编辑
  - [x] 头像上传/编辑
  - [x] 手机号编辑
  - [x] 邮箱编辑
  - [x] 性别编辑
  - [x] 生日编辑
  - [x] 用户标签管理

- [x] 消费记录
  - [x] 历史订单列表
  - [x] 总消费金额
  - [x] 订单总数
  - [x] 积分余额
  - [x] 平均客单价

- [x] 地址管理
  - [x] 地址簿列表
  - [x] 添加新地址
  - [x] 编辑地址
  - [x] 删除地址
  - [x] 设置默认地址

### 3.3 用户操作
- [x] 发送优惠券给用户
- [x] 调整用户积分
- [x] 修改用户标签
- [x] 禁用/启用用户账号
- [x] 手动重置密码

### 3.4 数据库表设计

**users 表**
```
id                  (主键)
username            (用户名)
password_hash       (密码哈希)
nickname            (昵称)
avatar              (头像URL)
phone               (手机号)
email               (邮箱)
gender              (性别)
birthday            (生日)
total_spent         (总消费金额)
order_count         (订单总数)
points_balance      (积分余额)
user_tags           (用户标签，用逗号分隔)
user_type           (用户类型: 活跃/沉默/流失)
status              (账户状态: 1正常 0禁用)
last_login_time     (最后登录时间)
created_at          (注册时间)
updated_at          (更新时间)
```

**user_addresses 表**
```
id                  (主键)
user_id             (用户ID)
name                (收货人名字)
phone               (收货人电话)
province            (省份)
city                (城市)
district            (区县)
detail_address      (详细地址)
is_default          (是否默认地址)
created_at          (创建时间)
updated_at          (更新时间)
```

---

## 四、API接口清单

### 4.1 商品管理 API

```
GET     /api/admin/products                    获取商品列表
POST    /api/admin/products                    创建商品
GET     /api/admin/products/{id}               获取商品详情
PUT     /api/admin/products/{id}               编辑商品
DELETE  /api/admin/products/{id}               删除商品
POST    /api/admin/products/batch-upload       批量导入商品
GET     /api/admin/products/export             导出商品列表

POST    /api/admin/products/{id}/images        上传商品图片
DELETE  /api/admin/products/{id}/images/{imgId} 删除商品图片
POST    /api/admin/products/{id}/images/reorder 商品图片排序

POST    /api/admin/products/{id}/publish       发布商品
POST    /api/admin/products/{id}/offline       下架商品
POST    /api/admin/products/batch-publish      批量发布
POST    /api/admin/products/batch-offline      批量下架
```

### 4.2 订单管理 API

```
GET     /api/admin/orders                      获取订单列表
GET     /api/admin/orders/{id}                 获取订单详情
PUT     /api/admin/orders/{id}                 编辑订单

GET     /api/admin/orders?status=pending_payment        待支付订单
POST    /api/admin/orders/{id}/send-payment-link        发送支付链接
POST    /api/admin/orders/{id}/mark-paid              标记已支付

GET     /api/admin/orders?status=pending_shipment       待发货订单
POST    /api/admin/orders/{id}/generate-shipping       生成发货单
POST    /api/admin/orders/{id}/shipping                配置物流信息
POST    /api/admin/orders/{id}/confirm-shipping        确认发货
POST    /api/admin/orders/batch-shipping              批量发货

GET     /api/admin/orders?status=shipped              已发货订单
GET     /api/admin/orders/{id}/logistics              获取物流信息
POST    /api/admin/orders/{id}/mark-received          标记已收货
POST    /api/admin/orders/{id}/update-logistics       更新物流单号

POST    /api/admin/orders/{id}/cancel                 取消订单
POST    /api/admin/orders/batch-cancel               批量取消订单
GET     /api/admin/orders/export                      导出订单列表
POST    /api/admin/orders/{id}/print-shipping         打印发货单
```

### 4.3 用户管理 API

```
GET     /api/admin/users                       获取用户列表
GET     /api/admin/users/{id}                  获取用户详情
PUT     /api/admin/users/{id}                  编辑用户信息
POST    /api/admin/users/{id}/disable          禁用用户账号
POST    /api/admin/users/{id}/enable           启用用户账号
POST    /api/admin/users/{id}/reset-password   重置用户密码

GET     /api/admin/users/{id}/addresses        获取用户地址簿
POST    /api/admin/users/{id}/addresses        添加地址
PUT     /api/admin/users/{id}/addresses/{addId} 编辑地址
DELETE  /api/admin/users/{id}/addresses/{addId} 删除地址
POST    /api/admin/users/{id}/addresses/{addId}/default 设置默认地址

GET     /api/admin/users/{id}/orders           获取用户订单
GET     /api/admin/users/{id}/statistics       获取用户统计信息

POST    /api/admin/users/{id}/points          调整用户积分
POST    /api/admin/users/{id}/tags            更新用户标签
POST    /api/admin/users/{id}/send-coupon     发送优惠券给用户
```

---

## 五、技术架构

### 后端
```
Node.js + Express.js
├─ Controller层（路由控制）
├─ Service层（业务逻辑）
├─ Repository层（数据访问）
└─ Middleware（中间件：鉴权、日志、错误处理）

数据库：MySQL 5.7+
缓存：Redis（可选，用于会话存储）
文件存储：OSS / 七牛云
```

### 前端
```
Vue 3 + TypeScript
├─ Element Plus（UI组件库）
├─ Pinia（状态管理）
├─ axios（HTTP请求）
├─ vue-router（路由）
└─ ECharts（数据可视化，可选）
```

---

## 六、核心功能模块关系图

```
后台管理系统
│
├─ 商品管理
│  ├─ 商品列表（CRUD）
│  └─ 商品编辑（详细页）
│
├─ 订单管理
│  ├─ 订单列表
│  ├─ 订单详情
│  ├─ 待支付处理
│  ├─ 待发货处理
│  └─ 已发货查看
│
└─ 用户管理
   ├─ 用户列表
   └─ 用户详情

数据关系：
users (1) ←→ (N) orders
users (1) ←→ (N) user_addresses
products (1) ←→ (N) order_items
orders (1) ←→ (N) order_items
orders (1) ←→ (1) order_logistics
```

---

## 七、工作量估算

| 模块 | 功能点 | 预计工时 | 难度 |
|------|--------|---------|------|
| 商品管理 | 15个 | 40小时 | 中等 |
| 订单管理 | 20个 | 50小时 | 中等 |
| 用户管理 | 12个 | 25小时 | 简单 |
| 数据库设计 | - | 10小时 | 简单 |
| API开发 | 45个端点 | 40小时 | 简单 |
| 前端开发 | 10个页面 | 60小时 | 中等 |
| 测试 | - | 30小时 | 简单 |
| **总计** | **62个功能** | **255小时** | - |

**时间线估算：**
- 团队规模：3人（1个后端、1个前端、1个测试）
- 总工期：约4-5周
- 可行性：**100%可行**

---

## 八、开发优先级

### 第1阶段（第1周）
- [x] 数据库设计与建表
- [x] API框架搭建
- [x] 登录认证系统
- [x] 基础CRUD接口

### 第2阶段（第2周）
- [x] 商品管理（CRUD + 图片管理）
- [x] 商品列表页面开发
- [x] 商品编辑页面开发

### 第3阶段（第3周）
- [x] 订单管理（列表 + 详情 + 发货流程）
- [x] 订单列表页面开发
- [x] 订单详情页面开发

### 第4阶段（第4周）
- [x] 用户管理（列表 + 详情 + 地址管理）
- [x] 用户列表页面开发
- [x] 用户详情页面开发

### 第5阶段（第5周）
- [x] 整体测试、修复、优化
- [x] 部署上线

---

## 九、总结

**完全可行！** ✅

这个精简版本是一个非常棒的MVP方案：
- 包含了所有核心业务功能
- 数据库设计清晰、优化度高
- 开发周期短（4-5周）
- 团队规模小（3人）
- 技术栈成熟、易于维护
- 后续易于扩展

**建议：**
1. 先完成这3个模块的开发和上线
2. 根据实际使用情况收集反馈
3. 后续逐步增加其他模块（营销、数据分析、财务等）
