# W2 小程序认证系统 - 完整开发指南

**周期**: 2025-11-03 ~ 2025-11-09
**模块**: 小程序认证系统 + API 集成 (Priority 1️⃣ for W2)
**状态**: 🚀 开发中

---

## 📋 W2 任务清单

### 任务 1: 创建认证服务层 ✅
- [ ] 创建 API 基础请求类 (axios/request)
- [ ] 创建认证服务 (登录、注册、刷新等)
- [ ] 创建本地存储管理 (Token、用户信息)
- [ ] 创建请求拦截器 (自动添加 Authorization header)
- [ ] 创建响应拦截器 (Token 刷新、错误处理)

### 任务 2: 实现登录/注册页面 ✅
- [ ] 创建登录页面 (login.vue)
- [ ] 创建注册页面 (register.vue)
- [ ] 创建登录表单验证
- [ ] 创建注册表单验证
- [ ] 实现登录/注册逻辑

### 任务 3: 完善个人中心页面 ✅
- [ ] 修改个人中心页面 (profile.vue)
- [ ] 创建编辑个人信息页面 (profile-edit.vue)
- [ ] 创建修改密码页面 (change-password.vue)
- [ ] 实现登出功能
- [ ] 显示用户信息和登录状态

### 任务 4: 全局状态管理 ✅
- [ ] 创建认证状态存储 (Pinia/Vuex)
- [ ] 管理用户信息、Token、登录状态
- [ ] 实现跳转到登录页的守卫

### 任务 5: 测试和优化 ✅
- [ ] 测试登录流程
- [ ] 测试注册流程
- [ ] 测试 Token 刷新
- [ ] 测试登出和会话清理
- [ ] 优化错误提示和用户体验

---

## 🏗️ 小程序架构设计

### 目录结构

```
miniprogram/src/
├── pages/
│   ├── auth/
│   │   ├── login.vue          # 登录页面
│   │   ├── register.vue       # 注册页面
│   │   └── login.json         # 路由配置
│   ├── profile/
│   │   ├── profile.vue        # 个人中心 (修改)
│   │   ├── edit.vue           # 编辑个人信息 (新建)
│   │   └── change-password.vue # 修改密码 (新建)
│   └── ... (其他页面)
├── services/
│   ├── api.ts                 # 基础 API 请求
│   ├── auth.ts                # 认证服务
│   └── storage.ts             # 本地存储管理
├── stores/
│   └── auth.ts                # Pinia 认证存储 (可选)
├── utils/
│   ├── request.ts             # 请求拦截器
│   └── validator.ts           # 表单验证
└── ... (其他目录)
```

---

## 🔑 认证流程设计

### 登录流程
```
1. 用户输入用户名/密码 → 表单验证
2. 调用 /auth/login API
3. 获取 accessToken + refreshToken
4. 保存到本地存储
5. 导航到主页或之前的页面
```

### 注册流程
```
1. 用户输入用户名/邮箱/密码 → 表单验证
2. 调用 /auth/register API
3. 获取 accessToken + refreshToken
4. 自动登录
5. 导航到主页
```

### 请求流程 (带 Token)
```
1. 请求前：添加 Authorization: Bearer {accessToken}
2. 响应成功 (200): 直接返回数据
3. 响应 401:
   - 尝试刷新 Token
   - 重试原始请求
   - 失败则跳转登录页
4. 响应其他错误: 显示错误提示
```

### Token 刷新流程
```
1. 检测到 accessToken 过期 (401)
2. 调用 /auth/refresh-token API (使用 refreshToken)
3. 获取新的 accessToken 和 refreshToken
4. 保存新 Token
5. 重试原始请求
```

### 登出流程
```
1. 调用 /auth/logout API (可选)
2. 清除本地存储
3. 清除 Token
4. 跳转到登录页
```

---

## 📝 核心代码实现

### 1. 基础 API 请求 (services/api.ts)

```typescript
// services/api.ts
const BASE_URL = process.env.VUE_APP_API_URL || 'http://localhost:8888/api/v1'

export const request = async (
  method: string,
  url: string,
  data?: any,
  options?: any
) => {
  const token = uni.getStorageSync('accessToken')

  const response = await uni.request({
    url: `${BASE_URL}${url}`,
    method: method as any,
    data,
    header: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  })

  return response.data
}

export const api = {
  get: (url: string, options?: any) => request('GET', url, undefined, options),
  post: (url: string, data?: any, options?: any) => request('POST', url, data, options),
  put: (url: string, data?: any, options?: any) => request('PUT', url, data, options),
  delete: (url: string, options?: any) => request('DELETE', url, undefined, options),
}
```

### 2. 认证服务 (services/auth.ts)

```typescript
// services/auth.ts
import { api } from './api'

export const authService = {
  // 用户注册
  async register(username: string, email: string, password: string) {
    return api.post('/auth/register', {
      username,
      email,
      password,
    })
  },

  // 用户登录
  async login(username: string, password: string) {
    const response = await api.post('/auth/login', {
      username,
      password,
    })

    // 保存 Token
    if (response.accessToken) {
      uni.setStorageSync('accessToken', response.accessToken)
      uni.setStorageSync('refreshToken', response.refreshToken)
      uni.setStorageSync('user', response.user)
    }

    return response
  },

  // 获取当前用户
  async getCurrentUser() {
    return api.get('/auth/me')
  },

  // 更新个人信息
  async updateProfile(data: any) {
    return api.put('/auth/profile', data)
  },

  // 修改密码
  async changePassword(currentPassword: string, newPassword: string) {
    return api.post('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword: newPassword,
    })
  },

  // 刷新 Token
  async refreshToken() {
    const refreshToken = uni.getStorageSync('refreshToken')
    const response = await api.post('/auth/refresh-token', {
      refreshToken,
    })

    if (response.accessToken) {
      uni.setStorageSync('accessToken', response.accessToken)
      uni.setStorageSync('refreshToken', response.refreshToken)
    }

    return response
  },

  // 登出
  async logout() {
    const refreshToken = uni.getStorageSync('refreshToken')
    await api.post('/auth/logout', { refreshToken }).catch(() => {})

    // 清除本地数据
    uni.removeStorageSync('accessToken')
    uni.removeStorageSync('refreshToken')
    uni.removeStorageSync('user')
  },
}
```

### 3. 登录页面 (pages/auth/login.vue)

```vue
<template>
  <view class="login-container">
    <view class="login-form">
      <view class="logo">Ruizhu</view>

      <view class="form-group">
        <input
          v-model="form.username"
          class="input"
          placeholder="用户名"
          @input="validateUsername"
        />
        <text v-if="errors.username" class="error">{{ errors.username }}</text>
      </view>

      <view class="form-group">
        <input
          v-model="form.password"
          class="input"
          type="password"
          placeholder="密码"
          @input="validatePassword"
        />
        <text v-if="errors.password" class="error">{{ errors.password }}</text>
      </view>

      <button
        class="btn-primary"
        :disabled="loading"
        @click="handleLogin"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <view class="footer">
        <text>还没有账号？</text>
        <navigator url="/pages/auth/register" class="link">注册</navigator>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { authService } from '../../services/auth'

const form = reactive({
  username: '',
  password: ''
})

const errors = reactive({
  username: '',
  password: ''
})

const loading = ref(false)

const validateUsername = () => {
  if (!form.username) {
    errors.username = '请输入用户名'
  } else if (form.username.length < 3) {
    errors.username = '用户名至少 3 个字符'
  } else {
    errors.username = ''
  }
}

const validatePassword = () => {
  if (!form.password) {
    errors.password = '请输入密码'
  } else if (form.password.length < 6) {
    errors.password = '密码至少 6 个字符'
  } else {
    errors.password = ''
  }
}

const handleLogin = async () => {
  validateUsername()
  validatePassword()

  if (errors.username || errors.password) return

  loading.value = true
  try {
    await authService.login(form.username, form.password)
    uni.showToast({ title: '登录成功', icon: 'success' })
    uni.redirectTo({ url: '/pages/index/index' })
  } catch (error: any) {
    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  padding: 40rpx 30rpx;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-form {
  width: 100%;
}

.logo {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 60rpx;
}

.form-group {
  margin-bottom: 30rpx;
}

.input {
  width: 100%;
  padding: 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.error {
  color: #ff3333;
  font-size: 24rpx;
  margin-top: 10rpx;
  display: block;
}

.btn-primary {
  width: 100%;
  padding: 20rpx;
  margin-top: 40rpx;
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 32rpx;
}

.btn-primary:disabled {
  opacity: 0.6;
}

.footer {
  text-align: center;
  margin-top: 40rpx;
  font-size: 28rpx;
}

.link {
  color: #007AFF;
  margin-left: 10rpx;
}
</style>
```

### 4. 个人中心页面修改 (pages/profile/profile.vue)

```vue
<template>
  <view class="profile-container">
    <view v-if="user" class="user-info">
      <view class="avatar">
        <image :src="user.avatar" :alt="user.username" />
      </view>
      <view class="info">
        <text class="username">{{ user.username }}</text>
        <text class="email">{{ user.email }}</text>
      </view>
    </view>

    <view class="menu">
      <view class="menu-item" @click="goToEdit">
        <text>编辑个人信息</text>
        <text class="arrow">></text>
      </view>
      <view class="menu-item" @click="goToChangePassword">
        <text>修改密码</text>
        <text class="arrow">></text>
      </view>
    </view>

    <button class="btn-logout" @click="handleLogout">
      登出
    </button>
  </view>

  <view v-else class="login-prompt">
    <text>请先登录</text>
    <navigator url="/pages/auth/login" class="btn-login">
      前往登录
    </navigator>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { authService } from '../../services/auth'

const user = ref(null)

onMounted(async () => {
  const savedUser = uni.getStorageSync('user')
  user.value = savedUser
})

const goToEdit = () => {
  uni.navigateTo({ url: '/pages/profile/edit' })
}

const goToChangePassword = () => {
  uni.navigateTo({ url: '/pages/profile/change-password' })
}

const handleLogout = async () => {
  uni.showModal({
    title: '确认登出',
    content: '确定要登出吗？',
    success: async (res) => {
      if (res.confirm) {
        await authService.logout()
        uni.showToast({ title: '已登出', icon: 'success' })
        uni.redirectTo({ url: '/pages/auth/login' })
      }
    }
  })
}
</script>

<style scoped>
.profile-container {
  padding: 20rpx;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  margin-bottom: 30rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20rpx;
}

.avatar image {
  width: 100%;
  height: 100%;
}

.info {
  flex: 1;
}

.username {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.email {
  display: block;
  font-size: 26rpx;
  color: #999;
  margin-top: 5rpx;
}

.menu {
  border-radius: 8rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
  background: white;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.menu-item:last-child {
  border-bottom: none;
}

.arrow {
  color: #999;
  font-size: 28rpx;
}

.btn-logout {
  width: 100%;
  padding: 20rpx;
  background: #ff3333;
  color: white;
  border: none;
  border-radius: 8rpx;
}

.login-prompt {
  padding: 100rpx 20rpx;
  text-align: center;
}

.btn-login {
  display: inline-block;
  margin-top: 20rpx;
  padding: 20rpx 40rpx;
  background: #007AFF;
  color: white;
  border-radius: 8rpx;
  text-decoration: none;
}
</style>
```

---

## 🔄 API 端点列表

| 方法 | 端点 | 功能 | 身份验证 |
|------|------|------|--------|
| POST | /auth/register | 用户注册 | 否 |
| POST | /auth/login | 用户登录 | 否 |
| GET | /auth/me | 获取当前用户 | 是 |
| PUT | /auth/profile | 更新个人信息 | 是 |
| POST | /auth/change-password | 修改密码 | 是 |
| POST | /auth/refresh-token | 刷新 Token | 否 |
| POST | /auth/logout | 登出 | 是 |

---

## 📊 小程序配置

### pages.json 更新

需要在 `pages.json` 中添加认证相关路由：

```json
{
  "pages": [
    {
      "path": "pages/auth/login",
      "style": {
        "navigationBarTitleText": "登录"
      }
    },
    {
      "path": "pages/auth/register",
      "style": {
        "navigationBarTitleText": "注册"
      }
    },
    {
      "path": "pages/profile/edit",
      "style": {
        "navigationBarTitleText": "编辑个人信息"
      }
    },
    {
      "path": "pages/profile/change-password",
      "style": {
        "navigationBarTitleText": "修改密码"
      }
    }
  ]
}
```

---

## 🧪 测试场景

### 场景 1: 新用户注册
1. 访问注册页面
2. 填写用户名、邮箱、密码
3. 点击注册
4. 验证 Token 保存
5. 导航到主页

### 场景 2: 用户登录
1. 访问登录页面
2. 填写用户名和密码
3. 点击登录
4. 验证 Token 保存
5. 显示用户信息

### 场景 3: 更新个人信息
1. 进入个人中心
2. 点击编辑个人信息
3. 修改昵称或电话
4. 保存更改
5. 验证信息更新

### 场景 4: 修改密码
1. 进入个人中心
2. 点击修改密码
3. 输入旧密码和新密码
4. 验证密码修改成功
5. 验证需要重新登录

### 场景 5: Token 刷新
1. 获取 Token
2. 等待 access token 过期模拟
3. 发送 API 请求
4. 验证自动刷新 Token
5. 验证请求成功

### 场景 6: 登出
1. 进入个人中心
2. 点击登出
3. 确认登出
4. 验证 Token 清除
5. 跳转到登录页

---

## 📋 W2 完成清单

### 服务层
- [ ] 创建 api.ts (基础请求)
- [ ] 创建 auth.ts (认证服务)
- [ ] 创建 storage.ts (存储管理)

### 页面
- [ ] 创建 pages/auth/login.vue
- [ ] 创建 pages/auth/register.vue
- [ ] 修改 pages/profile/profile.vue
- [ ] 创建 pages/profile/edit.vue
- [ ] 创建 pages/profile/change-password.vue

### 状态管理 (可选)
- [ ] 创建 Pinia store
- [ ] 集成身份验证状态

### 测试
- [ ] 测试登录流程
- [ ] 测试注册流程
- [ ] 测试 Token 管理
- [ ] 测试错误处理

---

## ⚡ 快速命令

```bash
# 启动小程序开发
cd miniprogram
npm run dev:mp-weixin

# 构建微信小程序
npm run build:mp-weixin

# 启动 H5 预览
npm run dev:h5
```

---

**下一步**: 实现认证服务和登录注册页面
**预计完成**: 2025-11-09
