<template>
  <view class="register-container">
    <view class="register-header">
      <text class="title">创建账号</text>
    </view>

    <view class="register-form">
      <view class="form-group">
        <text class="label">用户名</text>
        <input
          v-model="form.username"
          class="input"
          placeholder="请输入用户名"
          @blur="validateUsername"
        />
        <text v-if="errors.username" class="error">{{ errors.username }}</text>
      </view>

      <view class="form-group">
        <text class="label">邮箱</text>
        <input
          v-model="form.email"
          class="input"
          type="email"
          placeholder="请输入邮箱"
          @blur="validateEmail"
        />
        <text v-if="errors.email" class="error">{{ errors.email }}</text>
      </view>

      <view class="form-group">
        <text class="label">密码</text>
        <input
          v-model="form.password"
          class="input"
          type="password"
          placeholder="请输入密码 (最少8位)"
          @blur="validatePassword"
        />
        <text v-if="errors.password" class="error">{{ errors.password }}</text>
      </view>

      <view class="form-group">
        <text class="label">确认密码</text>
        <input
          v-model="form.confirmPassword"
          class="input"
          type="password"
          placeholder="请再次输入密码"
          @blur="validateConfirmPassword"
        />
        <text v-if="errors.confirmPassword" class="error">
          {{ errors.confirmPassword }}
        </text>
      </view>

      <button
        class="btn-register"
        :disabled="loading || !formValid"
        @click="handleRegister"
      >
        {{ loading ? '注册中...' : '注册' }}
      </button>

      <view class="footer">
        <navigator url="/pages/auth/login" class="link">
          已有账号？立即登录
        </navigator>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { authService } from '../../services/auth'

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)

const validateUsername = () => {
  if (!form.username) {
    errors.username = '请输入用户名'
  } else if (form.username.length < 3) {
    errors.username = '用户名至少3个字符'
  } else {
    errors.username = ''
  }
}

const validateEmail = () => {
  if (!form.email) {
    errors.email = '请输入邮箱'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '请输入有效的邮箱地址'
  } else {
    errors.email = ''
  }
}

const validatePassword = () => {
  if (!form.password) {
    errors.password = '请输入密码'
  } else if (form.password.length < 8) {
    errors.password = '密码至少8个字符'
  } else {
    errors.password = ''
  }
}

const validateConfirmPassword = () => {
  if (!form.confirmPassword) {
    errors.confirmPassword = '请确认密码'
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = '两次输入的密码不一致'
  } else {
    errors.confirmPassword = ''
  }
}

const formValid = computed(
  () =>
    form.username &&
    form.email &&
    form.password &&
    form.confirmPassword &&
    !errors.username &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword
)

const handleRegister = async () => {
  validateUsername()
  validateEmail()
  validatePassword()
  validateConfirmPassword()

  if (!formValid.value) return

  loading.value = true
  try {
    await authService.register(form.username, form.email, form.password)
    uni.showToast({ title: '注册成功', icon: 'success' })

    // 使用 switchTab 跳转到 tabBar 页面（index 是 tabBar 页面）
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
  } catch (error: any) {
    uni.showToast({
      title: error.message || '注册失败',
      icon: 'none',
      duration: 2000
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx;
}

.register-header {
  text-align: center;
  margin: 40rpx 0 60rpx 0;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: white;
}

.register-form {
  background: white;
  border-radius: 16rpx;
  padding: 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.input {
  width: 100%;
  padding: 16rpx 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.input:focus {
  border-color: #667eea;
}

.error {
  display: block;
  color: #ff3333;
  font-size: 24rpx;
  margin-top: 8rpx;
}

.btn-register {
  width: 100%;
  padding: 18rpx;
  margin-top: 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 32rpx;
  font-weight: 500;
}

.btn-register:disabled {
  opacity: 0.6;
}

.footer {
  text-align: center;
  margin-top: 30rpx;
}

.link {
  color: #667eea;
  font-size: 26rpx;
  text-decoration: none;
}
</style>
