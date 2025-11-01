<template>
  <view class="authorization-page">
    <!-- 顶部说明 -->
    <view class="authorization-header">
      <text class="header-title">个人信息授权</text>
      <view class="header-content">
        <text class="header-text">
您帐户的个人信息将被用于为您的小程序号航和结账手续提供便利，并(如果在您已同意情况下)为您提供为注册会员保留的专属服务利利益。
        </text>
        <text class="header-text">
想了解更多信息，请阅读我们的<text class="link-text" @tap="goToPrivacy">隐私政策</text>。
        </text>
        <text class="header-text">
您可以在下方查看和修改您的同意。
        </text>
      </view>
    </view>

    <!-- 授权选项 -->
    <view class="authorization-content">
      <!-- 第一项：注册于RUIZHU集团顾客数据库 -->
      <view class="authorization-section">
        <view class="section-header">
          <view class="checkbox-group" @tap="toggleCheckbox('registration')">
            <view class="checkbox" :class="{ checked: authorizations.registration }">
              <text v-if="authorizations.registration" class="checkbox-icon">✔</text>
            </view>
            <text class="section-title">注册于RUIZHU集团顾客数据库</text>
          </view>
        </view>
        <text class="section-text">
用户注册目的，您需要提供您的手机号码。如果您拒绝将导致本服务服务无法正常运行，我们将无法为您提供服务。
我们同意贵司为下列可选目的的收集、使用与披露我的个人信息：
        </text>
        <view class="option-row">
          <text class="option-label">分析:</text>
          <view class="option-checkboxes">
            <view class="small-checkbox" :class="{ checked: authorizations.analysis }" @tap="toggleCheckbox('analysis')">
              <text v-if="authorizations.analysis" class="checkbox-icon">✔</text>
            </view>
            <text class="option-text">是</text>
            <view class="small-checkbox" @tap="toggleCheckbox('analysis', false)">
              <text v-if="!authorizations.analysis" class="checkbox-icon">✔</text>
            </view>
            <text class="option-text">否</text>
          </view>
        </view>
        <text class="option-desc">
为进行与我对 RUIZHU 及RUIZHU集团的某他品牌、产品和服务的偏好实施个人和团体研究、调查、数据分析，以及市场研究，从而提供个性化服务。
        </text>
      </view>

      <!-- 第二项：营销 -->
      <view class="authorization-section">
        <view class="section-header">
          <view class="checkbox-group">
            <view class="checkbox" :class="{ checked: authorizations.marketing }" @tap="toggleCheckbox('marketing')">
              <text v-if="authorizations.marketing" class="checkbox-icon">✔</text>
            </view>
            <text class="section-title">营销</text>
          </view>
        </view>
        <text class="section-text">
为接受联络和/或接受（通过电邮、电话、电子邮件或任何其他形式的电子通信或数码方式，包括社交网络平台和其他即时通讯应用）与RUIZHU及RUIZHU集团的其他品牌、产品和服务相关的资讯及推广，包括商业性质、时事通讯、广告、目录及活动邀请。
        </text>
      </view>

      <!-- 第三项：个人信息的跨境转移 -->
      <view class="authorization-section">
        <view class="section-header">
          <view class="checkbox-group" @tap="toggleCheckbox('transfer')">
            <view class="checkbox" :class="{ checked: authorizations.transfer }">
              <text v-if="authorizations.transfer" class="checkbox-icon">✔</text>
            </view>
            <text class="section-title">个人信息的跨境转移</text>
          </view>
        </view>
        <text class="section-text">
我也知晓并同意贵司将我的个人信息跨境转移给RUIZHU股份有限公司，即位于意大利的RUIZHU集团2号运营控股公司，从而加入RUIZHU集团顾客数据库，该信息将为所有 RUIZHU集团旗下商店 可识别/或共享，从而提供隐私政策中描述的全球客户服务。
        </text>
      </view>
    </view>

    <!-- 停用账户 -->
    <view class="deactivate-section">
      <text class="deactivate-title">停用我的账户</text>
      <text class="deactivate-text">
如果您想要永久关闭和删除您的账户，请点击<text class="link-text" @tap="onDeactivateAccount">这里</text>。
      </text>
    </view>

    <!-- 底部保存按钮 -->
    <view class="authorization-footer">
      <view class="save-btn" @tap="onSaveAuthorization">
        <text>保存</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      authorizations: {
        registration: true,
        analysis: true,
        marketing: true,
        transfer: true
      },
      apiBaseUrl: 'https://yunjie.online/api',
      isLoading: false,
      isSaving: false
    }
  },
  onLoad() {
    this.loadAuthorizations()
  },
  onShow() {
    // Reload on page display to ensure latest data
    this.loadAuthorizations()
  },
  methods: {
    /**
     * Load user's authorization settings from server
     */
    async loadAuthorizations() {
      this.isLoading = true
      try {
        const token = uni.getStorageSync('accessToken')
        if (!token) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          return
        }

        const response = await uni.request({
          url: `${this.apiBaseUrl}/user/authorizations`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('授权设置响应:', response)

        if (response && response.statusCode === 200 && response.data) {
          // Convert API response (0/1) to boolean for UI
          this.authorizations = {
            registration: response.data.registration === 1,
            analysis: response.data.analysis === 1,
            marketing: response.data.marketing === 1,
            transfer: response.data.transfer === 1
          }
        } else {
          console.warn('获取授权设置失败:', response?.statusCode)
        }
      } catch (error) {
        console.error('加载授权设置出错:', error)
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Toggle checkbox for authorization
     */
    toggleCheckbox(key, value = null) {
      if (value !== null) {
        this.authorizations[key] = value
      } else {
        this.authorizations[key] = !this.authorizations[key]
      }
    },

    /**
     * Navigate to privacy policy page
     */
    goToPrivacy() {
      uni.navigateTo({
        url: '/pages/legal/legal'
      })
    },

    /**
     * Deactivate user account (delete)
     */
    onDeactivateAccount() {
      uni.showModal({
        title: '停用账户',
        content: '您确定要永久删除您的账户吗？此操作无法撤销。',
        success: async (res) => {
          if (res.confirm) {
            try {
              const token = uni.getStorageSync('accessToken')
              if (!token) {
                uni.showToast({
                  title: '请先登录',
                  icon: 'none'
                })
                return
              }

              const response = await uni.request({
                url: `${this.apiBaseUrl}/users/deactivate`,
                method: 'DELETE',
                header: {
                  'Authorization': `Bearer ${token}`
                }
              })

              if (response && response.statusCode === 200) {
                uni.showToast({
                  title: '账户已删除',
                  icon: 'success',
                  duration: 1500
                })

                // Clear local storage and navigate back after delay
                setTimeout(() => {
                  uni.removeStorageSync('accessToken')
                  uni.removeStorageSync('userInfo')
                  uni.reLaunch({
                    url: '/pages/auth/login'
                  })
                }, 1500)
              } else {
                uni.showToast({
                  title: '删除账户失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              console.error('删除账户出错:', error)
              uni.showToast({
                title: '删除账户出错',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    /**
     * Save authorization settings to server
     */
    async onSaveAuthorization() {
      if (this.isSaving) return

      this.isSaving = true
      try {
        const token = uni.getStorageSync('accessToken')
        if (!token) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          this.isSaving = false
          return
        }

        // Convert boolean to 0/1 for API
        const payload = {
          registration: this.authorizations.registration ? 1 : 0,
          analysis: this.authorizations.analysis ? 1 : 0,
          marketing: this.authorizations.marketing ? 1 : 0,
          transfer: this.authorizations.transfer ? 1 : 0
        }

        const response = await uni.request({
          url: `${this.apiBaseUrl}/user/authorizations`,
          method: 'PUT',
          data: payload,
          header: {
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('保存授权设置响应:', response)

        if (response && response.statusCode === 200) {
          uni.showToast({
            title: '授权设置已保存',
            icon: 'success',
            duration: 1500
          })

          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: '保存失败，请重试',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('保存授权设置出错:', error)
        uni.showToast({
          title: '保存出错',
          icon: 'none'
        })
      } finally {
        this.isSaving = false
      }
    }
  }
}
</script>

<style lang="scss">
.authorization-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  padding-bottom: 120rpx;
}

/* 顶部说明 */
.authorization-header {
  padding: 40rpx;
  border-bottom: 1px solid #f0f0f0;

  .header-title {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 24rpx;
  }

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 16rpx;

    .header-text {
      display: block;
      font-size: 26rpx;
      color: #666666;
      line-height: 1.6;

      .link-text {
        color: #000000;
        text-decoration: underline;
        cursor: pointer;
      }
    }
  }
}

/* 授权内容 */
.authorization-content {
  flex: 1;
  padding: 40rpx;
  overflow-y: auto;

  .authorization-section {
    margin-bottom: 40rpx;
    padding-bottom: 40rpx;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .section-header {
      margin-bottom: 20rpx;

      .checkbox-group {
        display: flex;
        align-items: flex-start;
        gap: 12rpx;
        cursor: pointer;

        .checkbox {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32rpx;
          height: 32rpx;
          border: 2px solid #000000;
          border-radius: 4rpx;
          flex-shrink: 0;
          background: #ffffff;
          transition: all 0.2s ease;

          &.checked {
            background: #000000;

            .checkbox-icon {
              display: block;
              color: #ffffff;
              font-size: 20rpx;
              font-weight: 600;
            }
          }

          .checkbox-icon {
            display: none;
          }
        }

        .section-title {
          display: block;
          font-size: 28rpx;
          font-weight: 600;
          color: #000000;
          flex: 1;
          padding-top: 2rpx;
        }
      }
    }

    .section-text {
      display: block;
      font-size: 26rpx;
      color: #666666;
      line-height: 1.6;
      margin-bottom: 20rpx;
    }

    .option-row {
      display: flex;
      align-items: center;
      gap: 16rpx;
      margin-bottom: 16rpx;

      .option-label {
        display: block;
        font-size: 26rpx;
        color: #333333;
        font-weight: 500;
        min-width: 60rpx;
      }

      .option-checkboxes {
        display: flex;
        align-items: center;
        gap: 12rpx;
        flex: 1;

        .small-checkbox {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28rpx;
          height: 28rpx;
          border: 2px solid #d0d0d0;
          border-radius: 4rpx;
          background: #ffffff;
          transition: all 0.2s ease;
          cursor: pointer;

          &.checked {
            background: #000000;
            border-color: #000000;

            .checkbox-icon {
              display: block;
              color: #ffffff;
              font-size: 16rpx;
              font-weight: 600;
            }
          }

          .checkbox-icon {
            display: none;
          }
        }

        .option-text {
          display: block;
          font-size: 26rpx;
          color: #666666;
        }
      }
    }

    .option-desc {
      display: block;
      font-size: 24rpx;
      color: #999999;
      line-height: 1.6;
      padding-left: 44rpx;
      margin-top: 12rpx;
    }
  }
}

/* 停用账户 */
.deactivate-section {
  padding: 40rpx;
  border-top: 1px solid #f0f0f0;

  .deactivate-title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 16rpx;
  }

  .deactivate-text {
    display: block;
    font-size: 26rpx;
    color: #666666;
    line-height: 1.6;

    .link-text {
      color: #000000;
      text-decoration: underline;
      cursor: pointer;
    }
  }
}

/* 底部保存按钮 */
.authorization-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #f0f0f0;
  padding: 24rpx 40rpx;
  padding-bottom: max(24rpx, env(safe-area-inset-bottom));

  .save-btn {
    width: 100%;
    padding: 20rpx 0;
    background: #000000;
    color: #ffffff;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    font-weight: 500;
    transition: all 0.2s ease;
    cursor: pointer;

    &:active {
      background: #333333;
      transform: scale(0.98);
    }

    text {
      display: block;
    }
  }
}
</style>
