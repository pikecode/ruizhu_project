<template>
  <view class="phone-auth-modal" v-if="visible">
    <!-- 背景遮罩 -->
    <view class="modal-overlay" @click="handleCancel"></view>

    <!-- 弹窗内容 -->
    <view class="modal-content">
      <!-- 关闭按钮 -->
      <view class="close-btn" @click="handleCancel">×</view>

      <!-- 标题和描述 -->
      <view class="modal-header">
        <view class="modal-title">授权手机号</view>
        <view class="modal-description">
          需要授权手机号以继续购物
        </view>
      </view>

      <!-- 说明文案 -->
      <view class="modal-tips">
        <view class="tips-item">
          <text class="tips-icon">✓</text>
          <text class="tips-text">快速完成身份验证</text>
        </view>
        <view class="tips-item">
          <text class="tips-icon">✓</text>
          <text class="tips-text">便于订单和物流通知</text>
        </view>
        <view class="tips-item">
          <text class="tips-icon">✓</text>
          <text class="tips-text">信息安全有保障</text>
        </view>
      </view>

      <!-- 授权按钮 -->
      <button
        class="auth-button"
        :class="{ loading: isLoading }"
        open-type="getPhoneNumber"
        @getphonenumber="handlePhoneNumber"
        :disabled="isLoading"
      >
        <text v-if="!isLoading">{{ buttonText }}</text>
        <text v-else class="loading-text">{{ loadingText }}</text>
      </button>

      <!-- 取消按钮 -->
      <button class="cancel-button" @click="handleCancel" :disabled="isLoading">
        取消
      </button>

      <!-- 错误提示 -->
      <view class="error-message" v-if="errorMessage">
        {{ errorMessage }}
      </view>
    </view>
  </view>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { authService } from '@/services/auth';

export default defineComponent({
  name: 'PhoneAuthModal',
  props: {
    /**
     * 是否显示弹窗
     */
    visible: {
      type: Boolean,
      default: false,
    },
    /**
     * 授权完成的回调
     */
    onSuccess: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
    /**
     * 取消授权的回调
     */
    onCancel: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
  },
  data() {
    return {
      isLoading: false,
      errorMessage: '',
      buttonText: '授权手机号并继续',
      loadingText: '正在授权...',
    };
  },
  methods: {
    /**
     * 处理手机号授权事件
     */
    async handlePhoneNumber(event: any) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        // 调用auth service处理授权
        const userInfo = await authService.handlePhoneNumberEvent(event);

        uni.showToast({
          title: '授权成功',
          icon: 'success',
          duration: 2000,
        });

        // 延迟一下再关闭，让用户看到成功提示
        setTimeout(() => {
          // 调用回调函数
          this.onSuccess?.();
          // 关闭弹窗
          this.$emit('close');
        }, 1500);
      } catch (error: any) {
        const message = error?.message || '授权失败，请重试';

        this.errorMessage = message;

        // 显示错误提示
        uni.showToast({
          title: message,
          icon: 'error',
          duration: 2000,
        });

        console.error('手机号授权失败:', error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * 处理取消授权
     */
    handleCancel() {
      if (this.isLoading) return;

      this.onCancel?.();
      this.$emit('close');
    },
  },
});
</script>

<style lang="scss" scoped>
.phone-auth-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  display: flex;
  align-items: flex-end;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  width: 100%;
  background-color: white;
  border-radius: 20px 20px 0 0;
  padding: 30px 24px;
  padding-bottom: 40px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #999;
  z-index: 10;

  &:active {
    opacity: 0.6;
  }
}

.modal-header {
  margin-bottom: 28px;
  text-align: center;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.modal-description {
  font-size: 14px;
  color: #999;
}

.modal-tips {
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.tips-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;

  &:last-child {
    margin-bottom: 0;
  }
}

.tips-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: #4CAF50;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  margin-right: 10px;
  flex-shrink: 0;
}

.tips-text {
  color: #666;
}

.auth-button {
  width: 100%;
  height: 50px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  transition: all 0.3s ease;

  &:active:not(:disabled) {
    background-color: #ff5252;
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
  }

  &.loading {
    opacity: 0.8;
  }
}

.loading-text {
  display: inline-flex;
  align-items: center;

  &::after {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    margin-left: 4px;
    background-color: white;
    border-radius: 50%;
    animation: loading 1.5s infinite;
  }

  @keyframes loading {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 1;
    }
  }
}

.cancel-button {
  width: 100%;
  height: 50px;
  background-color: #f0f0f0;
  color: #666;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;

  &:active:not(:disabled) {
    background-color: #e0e0e0;
  }

  &:disabled {
    opacity: 0.6;
  }
}

.error-message {
  margin-top: 12px;
  padding: 10px 12px;
  background-color: #ffebee;
  border-left: 4px solid #f44336;
  border-radius: 4px;
  color: #c62828;
  font-size: 13px;
  line-height: 1.5;
}
</style>
