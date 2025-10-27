<template>
  <view class="login-container">
    <view class="login-header">
      <text class="title">Ruizhu</text>
      <text class="subtitle">瑞珠电商平台</text>
    </view>

    <view class="login-form">
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
        <text class="label">密码</text>
        <input
          v-model="form.password"
          class="input"
          type="password"
          placeholder="请输入密码 (最少6位)"
          @blur="validatePassword"
        />
        <text v-if="errors.password" class="error">{{ errors.password }}</text>
      </view>

      <button
        class="btn-login"
        :disabled="loading || !formValid"
        @click="handleLogin"
      >
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <view class="footer">
        <navigator url="/pages/auth/register" class="link">
          没有账号？立即注册
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
    errors.username = '用户名至少3个字符'
  } else {
    errors.username = ''
  }
}

const validatePassword = () => {
  if (!form.password) {
    errors.password = '请输入密码'
  } else if (form.password.length < 6) {
    errors.password = '密码至少6个字符'
  } else {
    errors.password = ''
  }
}

const formValid = computed(
  () => form.username && form.password && !errors.username && !errors.password
)

const handleLogin = async () => {
  validateUsername()
  validatePassword()

  if (!formValid.value) return

  loading.value = true
  try {
    await authService.login(form.username, form.password)
    uni.showToast({ title: '登录成功', icon: 'success' })

    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/index/index' })
    }, 1500)
  } catch (error: any) {
    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none',
      duration: 2000
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-header {
  text-align: center;
  margin-bottom: 80rpx;
}

.title {
  display: block;
  font-size: 80rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 20rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.login-form {
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

.btn-login {
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

.btn-login:disabled {
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
