<template>
  <view class="edit-profile-page">
    <scroll-view class="form-container" scroll-y="true">
      <view class="form-card">
        <text class="section-title">基本信息</text>

        <view class="field">
          <text class="field-label">称谓</text>
          <view class="form-control">
            <picker :range="['先生', '女士']" @change="onSalutationChange" class="picker-wrapper">
              <view class="picker-content">
                <view class="picker-value">{{ formData.salutation }}</view>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>
        </view>

        <view class="field">
          <text class="field-label">姓氏</text>
          <view class="form-control">
            <input
              class="form-input"
              v-model="formData.lastName"
              placeholder="输入您的姓氏"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <view class="field">
          <text class="field-label">名字</text>
          <view class="form-control">
            <input
              class="form-input"
              v-model="formData.firstName"
              placeholder="输入您的名字"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>

        <view class="field">
          <text class="field-label">出生日期</text>
          <view class="form-control date-group">
            <picker :range="yearRange" @change="onYearChange" class="date-picker">
              <view class="picker-content">
                <view class="picker-value">{{ formData.year }}</view>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
            <picker :range="monthRange" @change="onMonthChange" class="date-picker">
              <view class="picker-content">
                <view class="picker-value">{{ formData.month }}</view>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
            <picker :range="dayRange" @change="onDayChange" class="date-picker">
              <view class="picker-content">
                <view class="picker-value">{{ formData.day }}</view>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>
          <text class="field-helper">我们会在您的生日月为您推送专属惊喜。</text>
        </view>
      </view>

      <view class="form-card">
        <text class="section-title">联系方式与地区</text>

        <view class="field">
          <text class="field-label">手机号码</text>
          <view class="form-control readonly-control">
            <text class="phone-value">{{ formData.phone }}</text>
            <text class="sync-tag">已同步微信</text>
          </view>
        </view>

        <view class="field">
          <text class="field-label">常驻地区</text>
          <view class="form-control location-group">
            <picker :range="provinces" @change="onProvinceChange" class="location-picker">
              <view class="picker-content">
                <view class="picker-value">{{ formData.province }}</view>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
            <picker :range="cities" @change="onCityChange" class="location-picker">
              <view class="picker-content">
                <view class="picker-value">{{ formData.city }}</view>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
            <picker :range="districts" @change="onDistrictChange" class="location-picker">
              <view class="picker-content">
                <view class="picker-value">{{ formData.district }}</view>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>
        </view>
      </view>

      <view class="form-card">
        <text class="section-title">隐私授权</text>

        <view class="checkbox-item">
          <view class="checkbox-wrapper">
            <view class="checkbox" :class="{ checked: formData.agree1 }" @tap="toggleCheckbox1">
              <text v-if="formData.agree1" class="checkbox-icon">✔</text>
            </view>
          </view>
          <view class="checkbox-content">
            <text class="checkbox-title">创建并维护我的 RUIZHU 帐户</text>
            <text class="checkbox-body">
              *我知悉并同意按照
              <text class="link-text" @tap="goPrivacy">隐私政策</text>
              收集与使用我的个人信息，以提供我所选择的服务。
            </text>
            <text class="checkbox-footnote">
              该授权为创建账户所必需，如拒绝我们将无法为您开通帐户。
            </text>
          </view>
        </view>

        <view class="checkbox-item">
          <view class="checkbox-wrapper">
            <view class="checkbox" :class="{ checked: formData.agree2 }" @tap="toggleCheckbox2">
              <text v-if="formData.agree2" class="checkbox-icon">✔</text>
            </view>
          </view>
          <view class="checkbox-content">
            <text class="checkbox-title">加入睿珠会员数据库</text>
            <text class="checkbox-body">
              我愿意接收基于我的兴趣定制的全球客户服务、专属活动邀请以及会员礼遇信息。
            </text>
            <text class="checkbox-footnote">此授权可随时在“我的”-“设置”中撤回。</text>
          </view>
        </view>
      </view>

      <view class="permission-info">
        <text>如需了解更多信息，请查阅《个人信息授权与使用说明》或联系专属顾问。</text>
      </view>

      <view class="button-group">
        <view class="save-btn" @tap="handleSave">
          <text>保存信息</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        salutation: '先生',
        lastName: '张',
        firstName: '',
        phone: '18621872825',
        year: '1990',
        month: '01',
        day: '01',
        province: '浙江省',
        city: '杭州',
        district: '西湖区',
        agree1: true,
        agree2: true
      },
      yearRange: Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - 99 + i).toString()),
      monthRange: Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')),
      dayRange: Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')),
      provinces: ['浙江省', '北京市', '上海市', '广东省', '江苏省'],
      cities: ['杭州', '宁波', '温州', '嘉兴'],
      districts: ['西湖区', '上城区', '下城区', '江干区']
    }
  },
  onLoad() {
    console.log('编辑个人信息页面加载完成')
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    onSalutationChange(e) {
      const salutations = ['先生', '女士']
      this.formData.salutation = salutations[e.detail.value]
    },
    onYearChange(e) {
      this.formData.year = this.yearRange[e.detail.value]
    },
    onMonthChange(e) {
      this.formData.month = this.monthRange[e.detail.value]
    },
    onDayChange(e) {
      this.formData.day = this.dayRange[e.detail.value]
    },
    onProvinceChange(e) {
      this.formData.province = this.provinces[e.detail.value]
    },
    onCityChange(e) {
      this.formData.city = this.cities[e.detail.value]
    },
    onDistrictChange(e) {
      this.formData.district = this.districts[e.detail.value]
    },
    toggleCheckbox1() {
      this.formData.agree1 = !this.formData.agree1
    },
    toggleCheckbox2() {
      this.formData.agree2 = !this.formData.agree2
    },
    goPrivacy() {
      uni.navigateTo({
        url: '/pages/legal/legal'
      })
    },
    handleSave() {
      if (!this.formData.agree1) {
        uni.showToast({
          title: '请同意第一项条款',
          icon: 'none'
        })
        return
      }
      uni.showToast({
        title: '信息已保存',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-profile-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f6f6f6;
}

.form-container {
  flex: 1;
  padding: 0 32rpx 80rpx;
  box-sizing: border-box;
}

.form-card {
  background: #ffffff;
  border-radius: 28rpx;
  padding: 36rpx 32rpx;
  margin-top: 32rpx;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.04);

  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #111111;
    margin-bottom: 28rpx;
  }
}

.field {
  margin-bottom: 32rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .field-label {
    display: block;
    font-size: 26rpx;
    color: #666666;
    margin-bottom: 12rpx;
  }

  .field-helper {
    display: block;
    margin-top: 12rpx;
    font-size: 22rpx;
    color: #999999;
  }
}

.form-control {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eeeeee;
  padding-bottom: 18rpx;
}

.form-input {
  flex: 1;
  font-size: 30rpx;
  color: #111111;
  background: transparent;
}

.input-placeholder {
  color: #cccccc;
  font-size: 28rpx;
}

.picker-wrapper,
.date-picker,
.location-picker {
  flex: 1;
}

.picker-content {
  display: flex;
  align-items: center;
  width: 100%;

  .picker-value {
    flex: 1;
    font-size: 30rpx;
    color: #111111;
  }

  .picker-arrow {
    font-size: 32rpx;
    color: #bbbbbb;
    margin-left: 12rpx;
  }
}

.date-group {
  gap: 24rpx;
  border-bottom: none;
  padding-bottom: 0;

  .date-picker {
    border-bottom: 1px solid #eeeeee;
    padding-bottom: 18rpx;

    .picker-value {
      font-size: 28rpx;
    }

    .picker-arrow {
      font-size: 26rpx;
    }
  }
}

.location-group {
  gap: 18rpx;
  border-bottom: none;
  padding-bottom: 0;

  .location-picker {
    border-bottom: 1px solid #eeeeee;
    padding-bottom: 18rpx;

    .picker-value {
      font-size: 28rpx;
    }

    .picker-arrow {
      font-size: 26rpx;
    }
  }
}

.readonly-control {
  border-bottom: none;
  padding-bottom: 0;
  justify-content: space-between;

  .phone-value {
    font-size: 32rpx;
    color: #111111;
    font-weight: 600;
  }

  .sync-tag {
    font-size: 22rpx;
    color: #999999;
    background: #f4f4f4;
    border-radius: 999rpx;
    padding: 6rpx 16rpx;
  }
}

.checkbox-item {
  display: flex;
  gap: 20rpx;
  margin-bottom: 32rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.checkbox-wrapper {
  padding-top: 8rpx;

  .checkbox {
    width: 36rpx;
    height: 36rpx;
    border: 2rpx solid #111111;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;

    &.checked {
      background: #111111;

      .checkbox-icon {
        color: #ffffff;
        font-size: 20rpx;
      }
    }
  }
}

.checkbox-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;

  .checkbox-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #111111;
  }

  .checkbox-body {
    font-size: 24rpx;
    line-height: 1.6;
    color: #444444;

    .link-text {
      color: #000000;
      border-bottom: 2rpx solid #111111;
    }
  }

  .checkbox-footnote {
    font-size: 22rpx;
    color: #999999;
  }
}

.permission-info {
  margin-top: 32rpx;
  font-size: 24rpx;
  color: #666666;
  line-height: 1.6;
  padding: 24rpx;
  border-radius: 20rpx;
  background: #ffffff;
}

.button-group {
  margin-top: 40rpx;

  .save-btn {
    width: 100%;
    height: 96rpx;
    border-radius: 999rpx;
    background: #111111;
    color: #ffffff;
    font-size: 32rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.15);

    &:active {
      opacity: 0.85;
    }
  }
}
</style>
