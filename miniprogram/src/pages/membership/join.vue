<template>
  <view class="join-page">
    <!-- 标题区 -->
    <view class="section-header">
      <text class="section-title">个人信息</text>
    </view>

    <!-- 表单主体 -->
    <view class="form">
      <!-- 称谓 -->
      <view class="form-row">
        <view class="form-col">
          <picker class="picker" mode="selector" :range="salutations" :value="salutationIndex" @change="onSalutationChange">
            <view class="picker-text">{{ salutations[salutationIndex] }}</view>
          </picker>
        </view>
      </view>

      <!-- 姓 / 名 -->
      <view class="form-row two-cols">
        <view class="form-col">
          <input class="input" type="text" placeholder="张" v-model="lastName" />
        </view>
        <view class="form-col">
          <input class="input" type="text" placeholder="先生" v-model="firstName" />
        </view>
      </view>

      <!-- 手机号 -->
      <view class="form-row">
        <view class="form-col">
          <input class="input" type="number" placeholder="请输入11位手机号" v-model="mobile" maxlength="11" />
        </view>
      </view>

      <!-- 出生日期：年/月/日 -->
      <view class="form-row three-cols">
        <view class="form-col">
          <picker class="picker" mode="selector" :range="years" :value="yearIndex" @change="(e)=>yearIndex=e.detail.value">
            <view class="picker-text">{{ years[yearIndex] || '年' }}</view>
          </picker>
        </view>
        <view class="form-col">
          <picker class="picker" mode="selector" :range="months" :value="monthIndex" @change="(e)=>monthIndex=e.detail.value">
            <view class="picker-text">{{ months[monthIndex] || '月' }}</view>
          </picker>
        </view>
        <view class="form-col">
          <picker class="picker" mode="selector" :range="days" :value="dayIndex" @change="(e)=>dayIndex=e.detail.value">
            <view class="picker-text">{{ days[dayIndex] || '日' }}</view>
          </picker>
        </view>
      </view>

      <!-- 省市区 -->
      <view class="form-row three-cols">
        <view class="form-col">
          <picker class="picker" mode="region" @change="onRegionChange">
            <view class="picker-text">{{ region[0] || '省份' }}</view>
          </picker>
        </view>
        <view class="form-col">
          <picker class="picker" mode="region" @change="onRegionChange">
            <view class="picker-text">{{ region[1] || '城市' }}</view>
          </picker>
        </view>
        <view class="form-col">
          <picker class="picker" mode="region" @change="onRegionChange">
            <view class="picker-text">{{ region[2] || '地区' }}</view>
          </picker>
        </view>
      </view>

      <!-- 主同意（必选） -->
      <view class="consent">
        <view class="consent-item" @tap="requiredConsent = !requiredConsent">
          <view class="checkbox" :class="{ checked: requiredConsent }"></view>
          <text class="consent-text">
            我希望在 Ruizhu 小程序上创建我的账户，并且知悉我的个人信息将用于提供如
            <text class="link" @tap.stop="openPolicy">隐私政策</text>
            中所述所要求的服务。
          </text>
        </view>
        <text class="consent-tip">
          用于创建您的在线账户，您需要提供您的姓名、手机号和位置。如果您拒绝将导致本服务无法正常运行，我们将无法为您提供服务。
        </text>
      </view>

      <!-- 额外同意（可选） -->
      <view class="consent">
        <view class="consent-item" @tap="marketingConsent = !marketingConsent">
          <view class="checkbox" :class="{ checked: marketingConsent }"></view>
          <text class="consent-text">
            我还希望加入集团顾客数据库，以便获得定制的全球客户服务，并享受为注册会员保留的专属服务和优惠。
          </text>
        </view>
        <text class="consent-tip">
          用于注册目的，您需要提供您的手机号。如果您拒绝将导致本服务无法正常运行，我们将无法为您提供服务。
        </text>
      </view>

      <!-- 可选信息同意列表（示例） -->
      <view class="optional-list">
        <text class="optional-title">我亦同意公司为下列可选目的的收集、使用与披露我的个人信息：</text>
        <view v-for="(item, idx) in optionalConsents" :key="idx" class="optional-row">
          <text class="optional-label">{{ item.label }}：</text>
          <view class="seg">
            <text class="seg-option" :class="{ active: item.value === true }" @tap="setOptional(idx, true)">是</text>
            <text class="seg-option" :class="{ active: item.value === false }" @tap="setOptional(idx, false)">否</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部保存按钮 -->
    <view class="footer">
      <view class="save-btn" @tap="onSave">
        <text>保存</text>
      </view>
    </view>
  </view>
</template>

<script>
import { api } from '../../services/api'

export default {
  data() {
    const years = []
    const now = new Date().getFullYear()
    for (let y = now; y >= 1930; y--) years.push(String(y))
    const months = Array.from({ length: 12 }, (_, i) => String(i + 1))
    const days = Array.from({ length: 31 }, (_, i) => String(i + 1))

    return {
      salutations: ['先生', '女士'],
      salutationIndex: 0,
      lastName: '',
      firstName: '',
      mobile: '',
      years,
      months,
      days,
      yearIndex: 0,
      monthIndex: 0,
      dayIndex: 0,
      region: ['', '', ''],

      requiredConsent: true,
      marketingConsent: true,
      optionalConsents: [
        { label: '分析', value: false },
        { label: '营销', value: false }
      ],

      // API related
      isLoading: false,
      isSaving: false
    }
  },
  onLoad() {
    this.loadMembershipProfile()
  },
  onShow() {
    // Reload on page display to ensure latest data
    this.loadMembershipProfile()
  },
  methods: {
    /**
     * Load existing membership profile if user is editing
     */
    async loadMembershipProfile() {
      this.isLoading = true
      try {
        const token = uni.getStorageSync('accessToken')
        if (!token) {
          this.isLoading = false
          return
        }

        const response = await api.get('/memberships')

        console.log('获取会员信息响应:', response)

        if (response && response.hasProfile) {
          const data = response
          this.salutationIndex = this.salutations.indexOf(data.salutation) || 0
          this.lastName = data.lastName || ''
          this.firstName = data.firstName || ''
          this.mobile = data.mobile || ''

          // Parse birth date if exists
          if (data.birthDate) {
            const [year, month, day] = data.birthDate.split('-')
            this.yearIndex = this.years.indexOf(year) || 0
            this.monthIndex = this.months.indexOf(month) || 0
            this.dayIndex = this.days.indexOf(day) || 0
          }

          // Set region
          if (data.province || data.city || data.district) {
            this.region = [data.province || '', data.city || '', data.district || '']
          }

          // Set consent flags
          this.requiredConsent = data.requiredConsent === 1
          this.marketingConsent = data.marketingConsent === 1
          this.optionalConsents[0].value = data.analysisConsent === 1
          this.optionalConsents[1].value = data.marketingOptionalConsent === 1
        }
      } catch (error) {
        console.error('加载会员信息出错:', error)
      } finally {
        this.isLoading = false
      }
    },

    onSalutationChange(e) {
      this.salutationIndex = e.detail.value
    },
    onRegionChange(e) {
      if (Array.isArray(e.detail.value)) {
        this.region = e.detail.value
      }
    },
    setOptional(idx, val) {
      this.optionalConsents[idx].value = val
      this.$forceUpdate?.()
    },
    openPolicy() {
      uni.navigateTo({
        url: '/pages/legal/legal'
      })
    },

    /**
     * Validate form data
     */
    validateForm() {
      if (!this.requiredConsent) {
        uni.showToast({ title: '请先同意隐私政策', icon: 'none' })
        return false
      }
      if (!this.lastName || !this.firstName) {
        uni.showToast({ title: '请填写姓名', icon: 'none' })
        return false
      }
      if (!this.mobile) {
        uni.showToast({ title: '请填写/授权手机号', icon: 'none' })
        return false
      }

      // Validate phone number format
      if (!/^1[3-9]\d{9}$/.test(this.mobile)) {
        uni.showToast({ title: '请输入有效的手机号', icon: 'none' })
        return false
      }

      return true
    },

    /**
     * Build birth date string
     */
    getBirthDate() {
      if (this.yearIndex === 0 || this.monthIndex === 0 || this.dayIndex === 0) {
        return null
      }
      const year = this.years[this.yearIndex]
      const month = String(this.monthIndex).padStart(2, '0')
      const day = String(this.dayIndex).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    /**
     * Save membership profile
     */
    async onSave() {
      if (!this.validateForm()) return
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

        const payload = {
          salutation: this.salutations[this.salutationIndex],
          lastName: this.lastName,
          firstName: this.firstName,
          mobile: this.mobile,
          birthDate: this.getBirthDate(),
          province: this.region[0] || null,
          city: this.region[1] || null,
          district: this.region[2] || null,
          requiredConsent: this.requiredConsent ? 1 : 0,
          marketingConsent: this.marketingConsent ? 1 : 0,
          analysisConsent: this.optionalConsents[0].value ? 1 : 0,
          marketingOptionalConsent: this.optionalConsents[1].value ? 1 : 0
        }

        console.log('保存会员信息，数据:', payload)

        try {
          // Check if profile exists
          const existingProfile = await api.get('/memberships')

          if (existingProfile && existingProfile.hasProfile) {
            // Update existing profile
            await api.put('/memberships', payload)
            console.log('更新会员信息成功')
          } else {
            // Create new profile
            await api.post('/memberships', payload)
            console.log('创建会员信息成功')
          }

          uni.showToast({
            title: '会员信息已保存',
            icon: 'success',
            duration: 1500
          })

          setTimeout(() => {
            uni.navigateBack({})
          }, 1500)
        } catch (apiError) {
          console.error('API 请求出错:', apiError)
          uni.showToast({
            title: '保存失败，请重试',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('保存会员信息出错:', error)
        uni.showToast({
          title: '保存出错，请检查网络',
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
.join-page {
  min-height: 100vh;
  background: #ffffff;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.section-header {
  padding: 40rpx;
}
.section-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #000000;
}

.form {
  padding: 0 40rpx;
}

.form-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eaeaea;
  padding: 28rpx 0;
}

.two-cols .form-col { width: 48%; }
.three-cols .form-col { width: 30%; }

.form-col { display: flex; align-items: center; }

.input {
  width: 100%;
  height: 72rpx;
  line-height: 72rpx;
  font-size: 28rpx;
  color: #000;
}

.picker { width: 100%; }
.picker-text { font-size: 28rpx; color: #000; }

.link-col { justify-content: flex-end; }
.link-btn { font-size: 26rpx; color: #000; text-decoration: underline; background: transparent; border: 0; padding: 0; }

.consent { padding: 24rpx 0; }
.consent-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}
.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #000;
  border-radius: 4rpx;
  margin-top: 6rpx;
}
.checkbox.checked { background: #000; }
.consent-text { font-size: 26rpx; color: #333; line-height: 1.6; }
.consent-tip { display: block; margin-top: 16rpx; font-size: 24rpx; color: #888; line-height: 1.6; }
.link { text-decoration: underline; }

.optional-list { padding: 24rpx 0 8rpx; }
.optional-title { display: block; font-size: 26rpx; color: #000; margin-bottom: 12rpx; }
.optional-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18rpx 0; border-bottom: 1px solid #f0f0f0;
}
.optional-label { font-size: 26rpx; color: #333; }
.seg { display: flex; align-items: center; gap: 16rpx; }
.seg-option { font-size: 26rpx; color: #999; padding: 8rpx 16rpx; border: 1px solid #ddd; border-radius: 6rpx; }
.seg-option.active { color: #fff; background: #000; border-color: #000; }

.footer {
  position: fixed;
  left: 0; right: 0; bottom: env(safe-area-inset-bottom);
  padding: 16rpx 40rpx calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #f0f0f0;
}
.save-btn {
  height: 88rpx;
  border-radius: 8rpx;
  background: #000;
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 32rpx; font-weight: 600;
}
.save-btn:active { background: #333; }
</style>

