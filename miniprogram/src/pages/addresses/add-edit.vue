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

      <!-- 省份、城市、地区 - 使用 picker 组件 -->
      <view class="form-row">
        <!-- 省份选择 -->
        <view class="form-group form-group-third">
          <label class="form-label">省份<text class="required">*</text></label>
          <picker mode="selector" :range="provinces" @change="onProvinceChange">
            <view class="form-select">
              <text class="select-value">{{ form.province || '请选择' }}</text>
              <text class="select-arrow">▼</text>
            </view>
          </picker>
        </view>

        <!-- 城市选择 -->
        <view class="form-group form-group-third">
          <label class="form-label">城市<text class="required">*</text></label>
          <picker v-if="currentCities.length > 0" mode="selector" :range="currentCities" @change="onCityChange">
            <view class="form-select">
              <text class="select-value">{{ form.city || '请选择' }}</text>
              <text class="select-arrow">▼</text>
            </view>
          </picker>
          <view v-else class="form-select disabled">
            <text class="select-value">请先选择省份</text>
            <text class="select-arrow">▼</text>
          </view>
        </view>

        <!-- 地区选择 -->
        <view class="form-group form-group-third">
          <label class="form-label">地区<text class="required">*</text></label>
          <picker v-if="currentDistricts.length > 0" mode="selector" :range="currentDistricts" @change="onDistrictChange">
            <view class="form-select">
              <text class="select-value">{{ form.district || '请选择' }}</text>
              <text class="select-arrow">▼</text>
            </view>
          </picker>
          <view v-else class="form-select disabled">
            <text class="select-value">请先选择城市</text>
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

    </view>

    <!-- 底部保存按钮 -->
    <view class="form-footer">
      <view class="save-btn" :class="{ disabled: isLoading }" @tap="onSaveAddress">
        <text>{{ isLoading ? '保存中...' : '保存地址' }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { api } from '../../services/api'
import { regionsService } from '../../services/regions'

export default {
  data() {
    return {
      mode: 'add', // 'add' or 'edit'
      isLoading: false,
      isLoadingRegions: true,
      form: {
        id: null,
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail: '',
        provinceId: null,
        cityId: null
      },
      provinces: [],
      provincesMap: {}, // 省份名称 -> ID 映射
      currentCities: [],
      currentCitiesMap: {}, // 城市名称 -> ID 映射
      currentDistricts: []
    }
  },
  async onLoad(options) {
    console.log('地址添加编辑页面加载')
    if (options.mode) {
      this.mode = options.mode
    }
    // 加载地区数据
    await this.loadRegionsData()
    // 如果是编辑模式，加载现有地址数据
    if (options.mode === 'edit' && options.id) {
      this.loadAddressData(parseInt(options.id))
    }
  },
  methods: {
    /**
     * 从API加载地区数据（省份列表）
     */
    async loadRegionsData() {
      try {
        this.isLoadingRegions = true
        // 获取所有省份
        const allProvinces = await api.get('/regions/provinces')
        this.provinces = allProvinces.map(p => p.name)
        // 构建省份ID映射
        allProvinces.forEach(p => {
          this.provincesMap[p.name] = p.id
        })
        console.log('✓ 地区数据加载完成，省份数:', this.provinces.length)
      } catch (error) {
        console.error('Failed to load regions:', error)
        uni.showToast({
          title: '加载地区数据失败',
          icon: 'none'
        })
      } finally {
        this.isLoadingRegions = false
      }
    },

    /**
     * 根据省份ID加载城市数据
     */
    async loadCitiesByProvince(provinceId) {
      try {
        const cities = await api.get(`/regions/cities?provinceId=${provinceId}`)
        this.currentCities = cities.map(c => c.name)
        // 构建城市ID映射
        this.currentCitiesMap = {}
        cities.forEach(c => {
          this.currentCitiesMap[c.name] = c.id
        })
        console.log('✓ 城市数据加载完成，城市数:', this.currentCities.length)
      } catch (error) {
        console.error('Failed to load cities:', error)
        this.currentCities = []
        this.currentCitiesMap = {}
      }
    },

    /**
     * 根据城市ID加载地区数据
     */
    async loadDistrictsByCity(cityId) {
      try {
        const districts = await api.get(`/regions/districts?cityId=${cityId}`)
        this.currentDistricts = districts.map(d => d.name)
        console.log('✓ 地区数据加载完成，地区数:', this.currentDistricts.length)
      } catch (error) {
        console.error('Failed to load districts:', error)
        this.currentDistricts = []
      }
    },

    /**
     * 从服务器加载地址数据
     */
    async loadAddressData(id) {
      try {
        const response = await api.get(`/addresses/${id}`)

        if (response) {
          // 字段映射：后端返回 receiverName/receiverPhone/addressDetail，前端期望 name/phone/detail
          this.form = {
            id: response.id,
            name: response.receiverName || response.name,
            phone: response.receiverPhone || response.phone,
            province: response.province,
            city: response.city,
            district: response.district,
            detail: response.addressDetail || response.detail,
            provinceId: null,
            cityId: null
          }

          // 根据省份名称获取省份ID，然后加载城市数据
          const provinceId = this.provincesMap[this.form.province]
          if (provinceId) {
            this.form.provinceId = provinceId
            await this.loadCitiesByProvince(provinceId)

            // 根据城市名称获取城市ID，然后加载地区数据
            const cityId = this.currentCitiesMap[this.form.city]
            if (cityId) {
              this.form.cityId = cityId
              await this.loadDistrictsByCity(cityId)
            }
          }

          console.log('加载的地址:', this.form, '当前城市:', this.currentCities, '当前地区:', this.currentDistricts)
        } else {
          console.warn('加载地址失败')
        }
      } catch (e) {
        console.error('Failed to load address:', e)
        uni.showToast({
          title: '加载地址失败',
          icon: 'none'
        })
      }
    },

    /**
     * 省份选择变化
     */
    async onProvinceChange(e) {
      const selectedIndex = e.detail.value
      this.form.province = this.provinces[selectedIndex]
      this.form.provinceId = this.provincesMap[this.form.province]
      this.form.city = ''
      this.form.district = ''
      this.form.cityId = null
      this.currentCities = []
      this.currentDistricts = []

      // 加载当前省份的城市列表
      if (this.form.provinceId) {
        await this.loadCitiesByProvince(this.form.provinceId)
      }

      console.log('选中省份:', this.form.province, '(ID:', this.form.provinceId, ') 可用城市:', this.currentCities.length)
    },

    /**
     * 城市选择变化
     */
    async onCityChange(e) {
      const selectedIndex = e.detail.value
      this.form.city = this.currentCities[selectedIndex]
      this.form.cityId = this.currentCitiesMap[this.form.city]
      this.form.district = ''
      this.currentDistricts = []

      // 加载当前城市的地区列表
      if (this.form.cityId) {
        await this.loadDistrictsByCity(this.form.cityId)
      }

      console.log('选中城市:', this.form.city, '(ID:', this.form.cityId, ') 可用地区:', this.currentDistricts.length)
    },

    /**
     * 地区选择变化
     */
    onDistrictChange(e) {
      const selectedIndex = e.detail.value
      this.form.district = this.currentDistricts[selectedIndex]

      console.log('选中地区:', this.form.district)
    },

    /**
     * 保存地址到服务器
     */
    async onSaveAddress() {
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

        // 字段映射：前端 name/phone/detail → 后端 receiverName/receiverPhone/addressDetail
        const addressData = {
          receiverName: this.form.name,
          receiverPhone: this.form.phone,
          province: this.form.province,
          city: this.form.city,
          district: this.form.district,
          addressDetail: this.form.detail
        }

        try {
          if (this.mode === 'add') {
            // 创建新地址
            await api.post('/addresses', addressData)
          } else {
            // 编辑现有地址
            await api.put(`/addresses/${this.form.id}`, addressData)
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
        } catch (error) {
          console.error('Failed to save address:', error)
          uni.showToast({
            title: '保存失败，请重试',
            icon: 'none'
          })
        }
      } catch (e) {
        console.error('Failed to validate address:', e)
        uni.showToast({
          title: '保存失败，请检查网络',
          icon: 'none'
        })
      } finally {
        this.isLoading = false
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

    &.disabled {
      cursor: not-allowed;
      opacity: 0.6;

      .select-value {
        color: #999999;
      }

      .select-arrow {
        color: #dddddd;
      }
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

    &.disabled {
      background: #d0d0d0;
      cursor: not-allowed;
      opacity: 0.6;

      &:active {
        transform: none;
      }
    }

    text {
      display: block;
    }
  }
}
</style>
