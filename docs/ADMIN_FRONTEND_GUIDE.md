# Ruizhu 管理后台开发指南

## 概述

管理后台是基于Vue 3 + TypeScript + Element Plus构建的SPA应用，用于管理产品、订单、优惠券、用户等核心业务数据。

---

## 功能模块

### 1. 仪表板 (Dashboard)
**位置：** `admin/src/views/Dashboard.vue`

**功能：**
- 显示关键指标：今日销售、订单数、用户数
- 最近订单列表
- 销售趋势图表
- 库存预警

**组件：**
```vue
<template>
  <div class="dashboard">
    <!-- 指标卡片 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6">
        <el-statistic title="今日销售" :value="todaySales">
          <template #prefix>¥</template>
        </el-statistic>
      </el-col>
      <!-- 更多卡片... -->
    </el-row>

    <!-- 图表 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="24" :md="12">
        <SalesChart />
      </el-col>
      <el-col :xs="24" :md="12">
        <OrderChart />
      </el-col>
    </el-row>

    <!-- 最近订单 -->
    <RecentOrders />
  </div>
</template>
```

---

### 2. 产品管理 (Products Management)

#### 2.1 产品列表
**位置：** `admin/src/views/Products/Index.vue`

**功能：**
- 分页列表展示
- 搜索、筛选（分类、状态）
- 排序（价格、销量、创建时间）
- 批量操作（上架、下架、删除）

**表格列：**
```
| SKU | 产品名称 | 分类 | 价格 | 库存 | 销量 | 状态 | 操作 |
|-----|---------|------|------|------|------|------|------|
```

**操作：**
- 编辑
- 查看详情
- 删除
- 上传图片

#### 2.2 添加/编辑产品
**位置：** `admin/src/views/Products/EditProduct.vue`

**表单字段：**
```
基本信息：
  - SKU (必填，唯一)
  - 产品名称 (必填)
  - 产品分类 (必填，下拉)
  - 简短描述
  - 详细描述 (富文本编辑器)

价格库存：
  - 现价 (必填)
  - 原价
  - 库存 (必填)

图片管理：
  - 上传多张图片 (拖拽或点击)
  - 设置缩略图
  - 调整顺序

变体管理：
  - 添加变体 (颜色、尺寸)
  - 设置变体库存
  - 变体价格调整

其他：
  - 是否精选
  - 显示顺序
  - 激活状态
```

**实现示例：**
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useProductStore } from '@/stores/products'

const productStore = useProductStore()
const formRef = ref()

interface Product {
  sku: string
  name: string
  categoryId: number
  price: number
  originalPrice: number
  stock: number
  images: File[]
  variants: Variant[]
  isFeatured: boolean
  status: 'active' | 'inactive' | 'draft'
}

const form = ref<Product>({
  sku: '',
  name: '',
  categoryId: undefined,
  price: 0,
  originalPrice: 0,
  stock: 0,
  images: [],
  variants: [],
  isFeatured: false,
  status: 'active'
})

const submitForm = async () => {
  await formRef.value.validate()

  // 上传图片
  for (const image of form.value.images) {
    if (image instanceof File) {
      await productStore.uploadImage(image)
    }
  }

  // 保存产品
  const response = await productStore.createProduct(form.value)

  ElMessage.success('产品创建成功')
  // 重定向到列表
  router.push('/products')
}
</script>

<template>
  <div class="edit-product">
    <el-card>
      <template #header>
        <span>{{ id ? '编辑产品' : '添加新产品' }}</span>
      </template>

      <el-form ref="formRef" :model="form" label-width="120px">
        <!-- SKU -->
        <el-form-item label="SKU" prop="sku" :rules="[
          { required: true, message: 'SKU不能为空' },
          { min: 3, max: 100, message: 'SKU长度3-100' }
        ]">
          <el-input v-model="form.sku" placeholder="输入产品SKU" />
        </el-form-item>

        <!-- 产品名称 -->
        <el-form-item label="产品名称" prop="name" :rules="[
          { required: true, message: '产品名称不能为空' }
        ]">
          <el-input v-model="form.name" placeholder="输入产品名称" />
        </el-form-item>

        <!-- 分类 -->
        <el-form-item label="分类" prop="categoryId" :rules="[
          { required: true, message: '请选择分类' }
        ]">
          <el-select v-model="form.categoryId">
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>

        <!-- 价格 -->
        <el-form-item label="现价" prop="price">
          <el-input-number v-model="form.price" :min="0" :step="0.01" />
        </el-form-item>

        <!-- 库存 -->
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" />
        </el-form-item>

        <!-- 图片上传 -->
        <el-form-item label="产品图片">
          <el-upload
            v-model:file-list="uploadList"
            action="#"
            :auto-upload="false"
            :on-change="handleUpload"
            multiple
            drag
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              Drop file here or <em>click to upload</em>
            </div>
          </el-upload>
        </el-form-item>

        <!-- 变体 -->
        <el-form-item label="产品变体">
          <el-table :data="form.variants">
            <el-table-column prop="color" label="颜色" width="120" />
            <el-table-column prop="size" label="尺寸" width="120" />
            <el-table-column prop="stock" label="库存" width="100" />
            <el-table-column label="操作" width="100">
              <template #default="{ $index }">
                <el-button
                  link
                  type="danger"
                  @click="form.variants.splice($index, 1)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button @click="addVariant">添加变体</el-button>
        </el-form-item>

        <!-- 提交 -->
        <el-form-item>
          <el-button type="primary" @click="submitForm">保存</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
```

---

### 3. 订单管理 (Orders Management)

#### 3.1 订单列表
**位置：** `admin/src/views/Orders/Index.vue`

**功能：**
- 订单列表分页展示
- 筛选（状态、日期范围、用户）
- 搜索（订单号、用户名、电话）
- 导出订单数据

**表格列：**
```
| 订单号 | 用户 | 金额 | 物流地址 | 状态 | 创建时间 | 操作 |
|--------|------|------|---------|------|---------|------|
```

**状态：**
- pending (待确认)
- confirmed (已确认)
- shipped (已发货)
- delivered (已收货)
- cancelled (已取消)

#### 3.2 订单详情
**位置：** `admin/src/views/Orders/OrderDetail.vue`

**内容：**
```
订单基本信息：
  - 订单号
  - 用户名、电话
  - 创建时间、更新时间

收货信息：
  - 收货人、电话
  - 省市区、详细地址

订单商品：
  表格：产品名称、规格、数量、单价、小计

订单费用：
  - 商品合计
  - 优惠券折扣
  - 快递费用
  - 订单总额

订单状态更新：
  - 当前状态
  - 更新状态下拉
  - 保存按钮
```

---

### 4. 优惠券管理 (Coupons Management)

#### 4.1 优惠券列表
**位置：** `admin/src/views/Coupons/Index.vue`

**表格列：**
```
| 优惠券代码 | 类型 | 优惠额度 | 可用期限 | 已使用/限制 | 状态 | 操作 |
|-----------|------|---------|---------|-----------|------|------|
```

**操作：**
- 编辑
- 禁用/启用
- 删除
- 查看使用记录

#### 4.2 创建/编辑优惠券
**位置：** `admin/src/views/Coupons/EditCoupon.vue`

**表单：**
```
基本信息：
  - 优惠券代码 (必填，唯一)
  - 优惠券描述

优惠类型：
  - 固定金额
  - 百分比
  - 免运费

优惠设置：
  - 优惠值 (必填)
  - 最低订单金额
  - 最高优惠金额 (百分比时使用)

限制条件：
  - 开始时间
  - 结束时间
  - 总使用次数限制
  - 每个用户最多使用次数

激活状态
```

---

### 5. 分类管理 (Categories)

**位置：** `admin/src/views/Categories/Index.vue`

**功能：**
- 分类列表（4个：服装、珠宝、鞋类、香水）
- 添加/编辑/删除分类
- 拖拽排序

---

### 6. 用户管理 (Users)

**位置：** `admin/src/views/Users/Index.vue`

**功能：**
- 用户列表
- 搜索（用户名、电话、openid）
- 禁用/启用用户
- 查看用户详情（订单历史、收藏列表）

---

### 7. 数据分析 (Analytics)

**位置：** `admin/src/views/Analytics/`

**页面：**
1. **销售分析** (SalesAnalytics.vue)
   - 日销售额走势
   - 按分类销售额
   - 销售排行榜

2. **订单分析** (OrderAnalytics.vue)
   - 订单数走势
   - 订单状态分布
   - 平均订单金额

3. **库存分析** (InventoryAnalytics.vue)
   - 库存预警（低于50）
   - 库存周转率
   - 滞销产品

---

## 项目结构

```
admin/src/
├── views/                          # 页面组件
│   ├── Dashboard.vue              # 仪表板
│   ├── Products/                  # 产品管理
│   │   ├── Index.vue             # 产品列表
│   │   ├── EditProduct.vue       # 编辑产品
│   │   └── ProductDetail.vue     # 产品详情
│   ├── Orders/                    # 订单管理
│   │   ├── Index.vue             # 订单列表
│   │   └── OrderDetail.vue       # 订单详情
│   ├── Coupons/                   # 优惠券管理
│   │   ├── Index.vue
│   │   └── EditCoupon.vue
│   ├── Categories/                # 分类管理
│   │   └── Index.vue
│   ├── Users/                     # 用户管理
│   │   ├── Index.vue
│   │   └── UserDetail.vue
│   ├── Analytics/                 # 数据分析
│   │   ├── SalesAnalytics.vue
│   │   ├── OrderAnalytics.vue
│   │   └── InventoryAnalytics.vue
│   ├── Layout.vue                 # 布局
│   ├── Login.vue                  # 登录
│   └── NotFound.vue               # 404
│
├── components/                     # 共享组件
│   ├── Sidebar.vue               # 侧边栏
│   ├── Header.vue                # 头部
│   ├── Pagination.vue            # 分页
│   ├── FilterPanel.vue           # 筛选面板
│   └── ImageUpload.vue           # 图片上传
│
├── stores/                        # Pinia stores
│   ├── user.ts                   # 用户登录状态
│   ├── products.ts               # 产品数据
│   ├── orders.ts                 # 订单数据
│   ├── coupons.ts                # 优惠券数据
│   └── common.ts                 # 通用状态
│
├── api/                           # API调用
│   ├── products.ts               # 产品API
│   ├── orders.ts                 # 订单API
│   ├── coupons.ts                # 优惠券API
│   ├── categories.ts             # 分类API
│   ├── users.ts                  # 用户API
│   ├── auth.ts                   # 认证API
│   └── index.ts                  # API基础配置
│
├── utils/                         # 工具函数
│   ├── request.ts                # HTTP请求封装
│   ├── format.ts                 # 格式化工具
│   ├── auth.ts                   # 认证工具
│   └── storage.ts                # 本地存储
│
├── styles/                        # 全局样式
│   ├── index.scss
│   └── variables.scss
│
├── router/                        # 路由
│   └── index.ts
│
├── main.ts                        # 入口
├── App.vue                        # 根组件
└── vite.config.ts                # Vite配置
```

---

## 状态管理 (Pinia)

### User Store
```typescript
// stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: null,
    isLoggedIn: false
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    async login(username: string, password: string) {
      const { token, user } = await authApi.login({ username, password })
      this.token = token
      this.user = user
      this.isLoggedIn = true
      localStorage.setItem('token', token)
    },

    logout() {
      this.token = ''
      this.user = null
      this.isLoggedIn = false
      localStorage.removeItem('token')
    }
  }
})
```

### Products Store
```typescript
// stores/products.ts
import { defineStore } from 'pinia'

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [],
    categories: [],
    total: 0,
    filters: {
      categoryId: null,
      status: 'active',
      page: 1,
      limit: 20
    }
  }),

  actions: {
    async fetchProducts() {
      const response = await productsApi.getProducts(this.filters)
      this.products = response.data
      this.total = response.total
    },

    async createProduct(product: Product) {
      return await productsApi.createProduct(product)
    },

    async updateProduct(id: number, product: Partial<Product>) {
      return await productsApi.updateProduct(id, product)
    },

    async deleteProduct(id: number) {
      await productsApi.deleteProduct(id)
      await this.fetchProducts()
    }
  }
})
```

---

## API 集成

### HTTP请求封装
```typescript
// utils/request.ts
import axios from 'axios'
import { useUserStore } from '@/stores/user'

const instance = axios.create({
  baseURL: '/api/v1',
  timeout: 30000
})

// 请求拦截
instance.interceptors.request.use((config) => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
})

// 响应拦截
instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // token过期，重新登录
      useUserStore().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default instance
```

### API 模块
```typescript
// api/products.ts
import request from '@/utils/request'

export const productsApi = {
  getProducts(filters: any) {
    return request.get('/admin/products', { params: filters })
  },

  getProductById(id: number) {
    return request.get(`/admin/products/${id}`)
  },

  createProduct(product: any) {
    return request.post('/admin/products', product)
  },

  updateProduct(id: number, product: any) {
    return request.patch(`/admin/products/${id}`, product)
  },

  deleteProduct(id: number) {
    return request.delete(`/admin/products/${id}`)
  },

  uploadImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}
```

---

## 路由配置

```typescript
// router/index.ts
const routes = [
  {
    path: '/login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/',
    component: () => import('@/views/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表板' }
      },
      {
        path: 'products',
        children: [
          {
            path: '',
            component: () => import('@/views/Products/Index.vue'),
            meta: { title: '产品列表' }
          },
          {
            path: ':id/edit',
            component: () => import('@/views/Products/EditProduct.vue'),
            meta: { title: '编辑产品' }
          }
        ]
      },
      {
        path: 'orders',
        children: [
          {
            path: '',
            component: () => import('@/views/Orders/Index.vue'),
            meta: { title: '订单列表' }
          },
          {
            path: ':id',
            component: () => import('@/views/Orders/OrderDetail.vue'),
            meta: { title: '订单详情' }
          }
        ]
      },
      // 更多路由...
    ]
  }
]
```

---

## 实现清单

### 第一阶段：核心页面
- [ ] 登录页面
- [ ] 仪表板 (基础版本)
- [ ] 产品列表
- [ ] 产品编辑
- [ ] 订单列表
- [ ] 订单详情

### 第二阶段：完整功能
- [ ] 优惠券管理
- [ ] 分类管理
- [ ] 用户管理
- [ ] 数据分析
- [ ] 图表集成 (ECharts)

### 第三阶段：增强功能
- [ ] 批量操作
- [ ] 数据导出 (Excel)
- [ ] 权限控制 (RBAC)
- [ ] 操作日志
- [ ] 系统设置

---

## 快速开始

```bash
# 进入admin目录
cd admin

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

---

## 开发建议

1. **使用TypeScript**: 所有组件使用TypeScript，提高代码质量
2. **按功能模块组织**: 相关文件放在同一目录
3. **单一职责**: 每个组件只做一件事
4. **可重用组件**: 抽取通用UI组件
5. **API抽象**: 所有API调用通过api模块
6. **错误处理**: 统一处理API错误和用户提示
7. **验证**: 表单字段必须验证
8. **性能**: 使用虚拟滚动处理大列表

---

## 参考资源

- Element Plus文档: https://element-plus.org
- Vue 3文档: https://vuejs.org
- Pinia文档: https://pinia.vuejs.org
- TypeScript文档: https://www.typescriptlang.org

---

**状态：** 框架设计完成 ✅ | 具体实现进行中 ⏳
