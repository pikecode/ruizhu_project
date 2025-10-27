<template>
  <view class="address-form-page">

    <!-- 表单内容 -->
    <view class="form-content">
      <!-- 收货人姓名 -->
      <view class="form-group">
        <label class="form-label">收货人<text class="required">*</text></label>
        <input
          v-model="form.name"
          class="form-input"
          type="text"
          placeholder="请输入收货人姓名"
        />
      </view>

      <!-- 手机号码 -->
      <view class="form-group">
        <label class="form-label">手机号码<text class="required">*</text></label>
        <input
          v-model="form.phone"
          class="form-input"
          type="text"
          placeholder="请输入手机号码"
        />
      </view>

      <!-- 省份、城市、地区 -->
      <view class="form-row">
        <view class="form-group form-group-third">
          <label class="form-label">省份<text class="required">*</text></label>
          <view class="form-select" @tap="showProvincePicker">
            <text class="select-value">{{ form.province || '请选择' }}</text>
            <text class="select-arrow">▼</text>
          </view>
        </view>
        <view class="form-group form-group-third">
          <label class="form-label">城市<text class="required">*</text></label>
          <view class="form-select" @tap="showCityPicker">
            <text class="select-value">{{ form.city || '请选择' }}</text>
            <text class="select-arrow">▼</text>
          </view>
        </view>
        <view class="form-group form-group-third">
          <label class="form-label">地区<text class="required">*</text></label>
          <view class="form-select" @tap="showDistrictPicker">
            <text class="select-value">{{ form.district || '请选择' }}</text>
            <text class="select-arrow">▼</text>
          </view>
        </view>
      </view>

      <!-- 详细地址 -->
      <view class="form-group">
        <label class="form-label">详细地址<text class="required">*</text></label>
        <textarea
          v-model="form.detail"
          class="form-textarea"
          placeholder="请输入详细地址"
          :fixed="true"
        ></textarea>
      </view>

      <!-- 设置默认地址复选框 -->
      <view class="form-checkbox-group">
        <view class="checkbox-item" @tap="form.isDefault = !form.isDefault">
          <view class="checkbox" :class="{ checked: form.isDefault }">
            <text v-if="form.isDefault" class="checkbox-icon">✔</text>
          </view>
          <text class="checkbox-label">设置默认地址</text>
        </view>
      </view>
    </view>

    <!-- 底部保存按钮 -->
    <view class="form-footer">
      <view class="save-btn" @tap="onSaveAddress">
        <text>保存地址</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      mode: 'add', // 'add' or 'edit'
      form: {
        id: null,
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail: '',
        isDefault: false
      },
      provinces: [
        '北京市', '天津市', '河北省', '山西省', '内蒙古自治区',
        '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省',
        '浙江省', '安徽省', '福建省', '江西省', '山东省',
        '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区',
        '海南省', '重庆市', '四川省', '贵州省', '云南省',
        '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区',
        '新疆维吾尔自治区', '台湾省', '香港特别行政区', '澳门特别行政区'
      ],
      cities: {
        '北京市': ['朝阳区', '东城区', '西城区', '宣武区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区', '通州区'],
        '上海市': ['浦东新区', '黄浦区', '静安区', '虹口区', '杨浦区', '长宁区', '普陀区', '闵行区', '宝山区', '嘉定区'],
        '广东省': ['广州市', '深圳市', '珠海市', '汕头市', '佛山市', '江门市', '湛江市', '茂名市', '肇庆市', '清远市']
      }
    }
  },
  onLoad(options) {
    console.log('地址添加编辑页面加载')
    if (options.mode) {
      this.mode = options.mode
    }
    // 如果是编辑模式，加载现有地址数据
    if (options.mode === 'edit' && options.id) {
      this.loadAddressData(parseInt(options.id))
    }
  },
  methods: {
    loadAddressData(id) {
      // 从存储中加载地址数据
      try {
        const addresses = uni.getStorageSync('userAddresses') || []
        const address = addresses.find(a => a.id === id)
        if (address) {
          this.form = { ...address }
        }
      } catch (e) {
        console.error('Failed to load address:', e)
      }
    },
    showProvincePicker() {
      uni.showActionSheet({
        itemList: this.provinces,
        success: (res) => {
          if (res.tapIndex !== -1) {
            this.form.province = this.provinces[res.tapIndex]
            this.form.city = ''
            this.form.district = ''
          }
        }
      })
    },
    showCityPicker() {
      if (!this.form.province) {
        uni.showToast({
          title: '请先选择省份',
          icon: 'none',
          duration: 1000
        })
        return
      }
      const cities = this.cities[this.form.province] || []
      uni.showActionSheet({
        itemList: cities.length > 0 ? cities : ['请选择城市'],
        success: (res) => {
          if (res.tapIndex !== -1 && cities.length > 0) {
            this.form.city = cities[res.tapIndex]
          }
        }
      })
    },
    showDistrictPicker() {
      if (!this.form.city) {
        uni.showToast({
          title: '请先选择城市',
          icon: 'none',
          duration: 1000
        })
        return
      }
      // 简化处理：地区使用城市值
      this.form.district = this.form.city
    },
    onSaveAddress() {
      // 验证必填字段
      if (!this.form.name) {
        uni.showToast({
          title: '请输入收货人姓名',
          icon: 'none',
          duration: 1000
        })
        return
      }
      if (!this.form.phone) {
        uni.showToast({
          title: '请输入手机号码',
          icon: 'none',
          duration: 1000
        })
        return
      }
      if (!this.form.province) {
        uni.showToast({
          title: '请选择省份',
          icon: 'none',
          duration: 1000
        })
        return
      }
      if (!this.form.city) {
        uni.showToast({
          title: '请选择城市',
          icon: 'none',
          duration: 1000
        })
        return
      }
      if (!this.form.detail) {
        uni.showToast({
          title: '请输入详细地址',
          icon: 'none',
          duration: 1000
        })
        return
      }

      try {
        // 生成ID（如果是新地址）
        if (!this.form.id) {
          const addresses = uni.getStorageSync('userAddresses') || []
          this.form.id = Math.max(0, ...addresses.map(a => a.id)) + 1
        }

        // 获取现有地址列表
        const addresses = uni.getStorageSync('userAddresses') || []

        if (this.mode === 'add') {
          // 如果设置为默认，取消其他地址的默认标志
          if (this.form.isDefault) {
            addresses.forEach(a => a.isDefault = false)
          }
          addresses.push(this.form)
        } else {
          // 编辑模式
          const index = addresses.findIndex(a => a.id === this.form.id)
          if (index !== -1) {
            if (this.form.isDefault) {
              addresses.forEach(a => a.isDefault = false)
            }
            addresses[index] = this.form
          }
        }

        // 保存到存储
        uni.setStorageSync('userAddresses', addresses)

        // 通过事件通知（如果存在）
        try {
          if (this.$wx && typeof this.$wx.getOpenerEventChannel === 'function') {
            const eventChannel = this.$wx.getOpenerEventChannel()
            if (eventChannel) {
              const eventName = this.mode === 'add' ? 'addressAdded' : 'addressUpdated'
              eventChannel.emit(eventName, this.form)
            }
          }
        } catch (e) {
          console.error('Failed to emit event:', e)
        }

        // 保存地址成功提示
        uni.showToast({
          title: '地址保存成功',
          icon: 'success',
          duration: 1500
        })

        // 延迟返回上一页
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } catch (e) {
        console.error('Failed to save address:', e)
        uni.showToast({
          title: '保存失败，请重试',
          icon: 'none',
          duration: 1000
        })
      }
    }
  }
}
</script>

<style lang="scss">
.address-form-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  padding-bottom: 120rpx;
}

/* 表单内容 */
.form-content {
  flex: 1;
  padding: 40rpx;
  overflow-y: auto;
}

/* 表单组 */
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 40rpx;

  &.form-group-half {
    width: calc(50% - 8rpx);
  }

  &.form-group-third {
    width: calc(33.333% - 10rpx);
  }

  .form-label {
    display: block;
    font-size: 26rpx;
    color: #333333;
    margin-bottom: 12rpx;
    font-weight: 500;

    .required {
      color: #ff0000;
      margin-left: 4rpx;
    }
  }

  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    padding: 16rpx 0;
    font-size: 28rpx;
    color: #000000;
    border: none;
    border-bottom: 1px solid #d0d0d0;
    background: transparent;
    transition: all 0.2s ease;

    &:focus {
      border-bottom-color: #000000;
    }

    &::placeholder {
      color: #cccccc;
    }
  }

  .form-select {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 16rpx 0;

    .select-value {
      display: block;
      font-size: 28rpx;
      color: #000000;
      flex: 1;
    }

    .select-arrow {
      display: block;
      font-size: 16rpx;
      color: #cccccc;
      margin-left: 12rpx;
    }
  }

  .form-textarea {
    min-height: 120rpx;
    resize: vertical;
    font-family: inherit;
  }
}

/* 表单行 */
.form-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 40rpx;
}

/* 复选框组 */
.form-checkbox-group {
  padding: 24rpx 0;
  margin-top: 24rpx;

  .checkbox-item {
    display: flex;
    align-items: center;
    gap: 12rpx;
    cursor: pointer;
    padding: 8rpx 0;

    .checkbox {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32rpx;
      height: 32rpx;
      border: 2px solid #d0d0d0;
      border-radius: 4rpx;
      transition: all 0.2s ease;
      flex-shrink: 0;

      &.checked {
        background: #000000;
        border-color: #000000;

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

    .checkbox-label {
      display: block;
      font-size: 28rpx;
      color: #333333;
    }
  }
}

/* 表单底部 */
.form-footer {
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
    background: #d0d0d0;
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
      background: #b0b0b0;
      transform: scale(0.98);
    }

    text {
      display: block;
    }
  }
}
</style>
